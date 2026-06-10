# Kaven CLI: Especificação de Module Patching & Upstream Git

Este documento contém a implementação técnica e pseudo-código/arquitetura para a funcionalidade de `kaven update` e o suporte ao Git Upstream no `kaven-cli`. Como o `kaven-cli` roda como um projeto isolado, este guia destrincha o código que deve ser incorporado na camada `src/core/`.

## 1. GitMergeService (`src/core/GitMergeService.ts`)

Esta classe será responsável por atuar como um wrapper para o `git merge-file`, que executará o 3-Way Merge de forma não destrutiva.

```typescript
import { spawn } from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path';

export interface MergeResult {
  success: boolean;
  conflicts: boolean;
  output: string;
}

export class GitMergeService {
  /**
   * Executa o 3-Way Merge do Git.
   * 
   * @param targetFile O arquivo no projeto do usuário (OURS)
   * @param baseFile O arquivo original no cache da versão antiga (BASE)
   * @param updateFile O arquivo novo na atualização do módulo (THEIRS)
   */
  public async performMerge(
    targetFile: string,
    baseFile: string,
    updateFile: string
  ): Promise<MergeResult> {
    
    // Fallback: se o arquivo BASE não existir, significa que o baseline se perdeu.
    // Nesse caso, podemos apenas abortar o merge para evitar overwrite destrutivo.
    if (!(await fs.pathExists(baseFile))) {
      throw new Error(`Baseline cache file missing: ${baseFile}. Cannot perform safe merge.`);
    }

    return new Promise((resolve, reject) => {
      // Usamos -q (quiet) para focar no exit code. Se der exit code > 0, há conflito.
      const proc = spawn('git', [
        'merge-file',
        '-L', 'Your Modifications (OURS)',
        '-L', 'Original Version (BASE)',
        '-L', 'Kaven Update (THEIRS)',
        targetFile,
        baseFile,
        updateFile
      ]);

      let output = '';

      proc.stdout.on('data', (data) => {
        output += data.toString();
      });

      proc.stderr.on('data', (data) => {
        output += data.toString();
      });

      proc.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, conflicts: false, output });
        } else if (code! > 0) {
          // O git merge-file retorna code > 0 quando há conflitos de merge, mas 
          // ele AINDA ASSIM preenche o targetFile com os marcadores de conflito.
          // Isso é o comportamento desejado.
          resolve({ success: true, conflicts: true, output });
        } else {
          reject(new Error(`Git merge-file failed critically: ${output}`));
        }
      });
    });
  }
}
```

## 2. Gerenciamento do Baseline no Install (`ModuleManager.ts`)

Quando o comando `kaven marketplace install <module>` for executado, o `ModuleManager` deve não apenas copiar os arquivos para seus destinos (`dest`), mas também fazer uma cópia exata do `src` para a pasta `.kaven/cache/modules/<module-slug>-<version>/`.

```typescript
// Exemplo de trecho em ModuleManager.ts - método installModule
import * as path from 'path';
import * as fs from 'fs-extra';

const KAVEN_CACHE_DIR = path.join(process.cwd(), '.kaven', 'cache', 'modules');

async function cacheBaseline(moduleJson: ModuleJson, extractedPath: string) {
  const cachePath = path.join(KAVEN_CACHE_DIR, `${moduleJson.slug}-${moduleJson.version}`);
  
  // Assegura que o diretório de cache existe
  await fs.ensureDir(cachePath);

  // Copia cada arquivo listado no manifesto do módulo para o Cache Base
  for (const fileDef of moduleJson.files) {
    const sourceFilePath = path.join(extractedPath, fileDef.src);
    const destCachePath = path.join(cachePath, fileDef.src);
    
    if (await fs.pathExists(sourceFilePath)) {
      await fs.ensureDir(path.dirname(destCachePath));
      await fs.copy(sourceFilePath, destCachePath);
    }
  }
  
  // Salva também o module.json como referência
  await fs.copy(
    path.join(extractedPath, 'module.json'), 
    path.join(cachePath, 'module.json')
  );
}
```

## 3. O Comando de Update (`kaven update <module>`)

O fluxo do comando chamará o serviço de merge.

```typescript
// Exemplo de lógica principal em commands/update/index.ts
import chalk from 'chalk';
import { GitMergeService } from '../../core/GitMergeService';

export async function updateModule(slug: string, targetVersion: string) {
  const currentVersion = getInstalledVersion(slug); // Lógica existente de manifesto
  
  console.log(chalk.blue(`🔄 Inciando update de ${slug} (${currentVersion} -> ${targetVersion})...`));
  
  // 1. Download do Novo Módulo para dir temporário (/tmp/update-theirs/)
  const extractedTheirsPath = await downloadAndExtract(slug, targetVersion);
  
  // 2. Caminho do Baseline Original
  const baselinePath = path.join(process.cwd(), '.kaven', 'cache', 'modules', `${slug}-${currentVersion}`);
  
  const mergeService = new GitMergeService();
  const moduleManifest = await readModuleManifest(extractedTheirsPath);
  
  let hasConflicts = false;
  const conflictFiles: string[] = [];

  for (const fileDef of moduleManifest.files) {
    const targetPath = path.join(process.cwd(), fileDef.dest); // OURS
    const baseFilePath = path.join(baselinePath, fileDef.src); // BASE
    const updateFilePath = path.join(extractedTheirsPath, fileDef.src); // THEIRS

    // Se o arquivo base não existir ou for um arquivo novo no update, é só copiar seguro.
    if (!(await fs.pathExists(targetPath))) {
        await fs.copy(updateFilePath, targetPath);
        continue;
    }
    
    // Tenta fazer o 3-Way Merge
    const mergeResult = await mergeService.performMerge(targetPath, baseFilePath, updateFilePath);
    
    if (mergeResult.conflicts) {
      hasConflicts = true;
      conflictFiles.push(fileDef.dest);
    }
  }

  // 3. Atualiza as âncoras/injections caso o novo manifesto possua coisas novas.
  await updateModuleInjections(moduleManifest);

  // 4. Salva a nova versão no Cache
  await cacheBaseline(moduleManifest, extractedTheirsPath);
  await updateInstalledVersionInManifest(slug, targetVersion);

  if (hasConflicts) {
    console.log(chalk.yellow(`\n⚠️ Update finalizado, mas ocorreram conflitos nos seguintes arquivos:`));
    conflictFiles.forEach(f => console.log(chalk.yellow(`   - ${f}`)));
    console.log(chalk.yellow(`\nPor favor, abra esses arquivos no seu editor para resolver os marcadores de conflito (<<<<<<< OURS) e commite.`));
  } else {
    console.log(chalk.green(`\n✅ Módulo ${slug} atualizado com sucesso para v${targetVersion} sem conflitos.`));
  }
}
```

## 4. Upstream Git (`kaven init --local`)

Para suportar atualizações do core do framework quando o dev instanciar via `kaven init` apontando localmente:

```typescript
// Em ProjectInitializer.ts, após finalizar a inicialização e o git init
async function configureUpstreamGit(targetDir: string, templateSource: string) {
  // Somente se for um template do github oficial do kaven, ou um remote explícito
  const upstreamUrl = templateSource.startsWith('/') || templateSource.startsWith('.') 
    ? 'git@github.com:kaven-co/kaven-framework.git' // Força o upstream real se instanciado de diretório local (dev/testes)
    : templateSource;
    
  await runCommand('git', ['remote', 'add', 'upstream', upstreamUrl], targetDir);
  console.log(`[INIT] Configurado remote 'upstream' apontando para ${upstreamUrl}`);
  console.log(`[INIT] Para receber atualizações estruturais futuras, você poderá usar: git fetch upstream && git merge upstream/main`);
}
```
