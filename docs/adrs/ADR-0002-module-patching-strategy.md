# ADR 0002: Estratégia de Module Patching (Atualização de Módulos Customizados)

**Status:** Proposed / Active  
**Data:** 1 de Junho de 2026  
**Autores:** @kaven-architect (Atlas)  
**Memória MCP:** ID `18336`

---

## 1. Contexto e Problema (A "Zona Nebulosa")

O ecossistema Kaven Framework foi arquitetado com uma forte distinção entre o "Core" (código interno do framework) e as áreas extensíveis da aplicação do usuário (ex: `apps/api/src/modules/`). Essa estrutura permite que os usuários iniciem projetos baseados no Kaven e adicionem lógicas de negócio livremente.

No entanto, o **Kaven Module System** introduz um desafio de versionamento e sincronização. O fluxo atual de instalação de módulos (`module.json`) funciona como uma "injeção de blueprints": arquivos fontes do módulo oficial são copiados para a estrutura de diretórios finais do projeto do usuário, e âncoras (ex: `// [KAVEN_MODULE_IMPORTS]`) são usadas para acoplar esse módulo na arquitetura do sistema.

Uma vez instalado, o código do módulo "pertence" ao usuário. Ele tem total liberdade para adaptar, estender e modificar as regras de negócio deste código (ex: alterar regras em um módulo de CRM ou Pagamentos). 

O problema surge durante a **atualização** (comando `kaven update <module>`):
- Se o Kaven lançar uma nova versão com correções de segurança ou melhorias, como o CLI deve aplicar essa atualização?
- **Overwrite (Copy/Paste destrutivo):** Se o CLI apenas copiar os novos arquivos por cima dos antigos, todas as customizações, lógicas de negócios e correções feitas pelo usuário naquele módulo serão irreversivelmente perdidas.
- **Isolamento Total:** Se forçarmos os módulos a não serem modificáveis, perde-se a flexibilidade e a filosofia principal de produtividade de um boilerplate (onde o código é apenas o ponto de partida).

Para resolver essa dicotomia, precisamos de uma estratégia de **"Module Patching"** robusta que permita o CLI aplicar atualizações oficiais do Kaven enquanto tenta, ao máximo, preservar e mesclar as customizações feitas pelo desenvolvedor localmente, abortando para resolução manual de forma segura quando necessário.

---

## 2. Decisão

Adotaremos o **Git 3-Way Merge** de forma nativa e agnóstica via CLI para o patching de módulos.

Ao invés de carregar bibliotecas Javascript de `diff/patch` pesadas, instáveis e propensas a falhas (como algoritmos simples de diff), utilizaremos a ferramenta de mesclagem nativa do Git: o `git merge-file`. Como o uso do Git já é um pré-requisito natural de qualquer desenvolvedor do Kaven (o projeto gerado é iniciado via Git), aproveitaremos essa fundação.

O `git merge-file` integra perfeitamente as alterações porque entende três pontos históricos do código, o que chamamos de **3-Way Merge**:
1. **BASE (Ancestor):** O estado original exato do código do módulo no momento em que o usuário o instalou.
2. **OURS (Atual do Usuário):** O estado atual do arquivo no projeto do usuário, contendo todas as customizações e lógicas que ele desenvolveu.
3. **THEIRS (Nova Versão Kaven):** O código atualizado que o Kaven CLI está tentando aplicar.

Se a nova versão da Kaven modificou uma função e o usuário adicionou código em outra área do mesmo arquivo, o 3-Way Merge consolida as duas alterações de maneira limpa e automática. Em caso de sobreposição literal (ambos alteraram a mesma linha), o comando inserirá as conhecidas tags de conflito (`<<<<<<< OURS`, `=======`, `>>>>>>> THEIRS`) permitindo ao usuário resolver de maneira idêntica a um merge conflict tradicional no seu editor de código preferido, sem destruir o trabalho existente e sem esconder o que foi feito.

---

## 3. Design Técnico e Workflow (Passo a Passo)

O fluxo de atualização de um módulo (`kaven update <module-name>`) seguirá a seguinte orquestração sequencial:

### Fase 1: Pré-Requisitos e Setup
1. **Sanity Check:** O CLI verifica se o projeto está num repositório Git e se o working directory está limpo. O ideal é recomendar que o usuário faça commit de qualquer mudança antes de atualizar um módulo.
2. **Identificação da Versão Instalada:** O CLI lê o `kaven.json` ou o manifesto de módulos instalados para saber a versão atual (ex: `v1.0.2`).
3. **Download da Nova Versão:** O CLI contata a Kaven Marketplace API, valida a licença do usuário e faz o download da nova versão (ex: `v1.1.0`) do módulo, extraindo os arquivos em uma pasta temporária (ex: `/tmp/kaven-update-session/theirs/`).

### Fase 2: Identificação do Baseline (A Fonte da Verdade)
Para que o 3-Way Merge funcione, precisamos do código-fonte exato do módulo na sua versão original. 
Durante a instalação original de qualquer módulo, o CLI passará a copiar os arquivos inalterados para um diretório de cache persistente e oculto dentro do projeto.
- Caminho: `.kaven/cache/modules/<module-name>-v1.0.2/`
Esse diretório representará o **BASE**.

### Fase 3: Avaliação e Mesclagem (Arquivo a Arquivo)
O CLI fará um loop em cada arquivo mapeado na diretiva `files` do `module.json`.

- **Cenário A (Arquivo não modificado pela atualização):** 
  Ignora o arquivo.
  
- **Cenário B (Atualização alterou, mas Usuário não tocou):**
  Hash(OURS) == Hash(BASE). O arquivo do usuário é idêntico ao original. O CLI substitui pelo novo arquivo (THEIRS) com segurança.
  
- **Cenário C (Ambos alteraram o arquivo - The 3-Way Merge):**
  O CLI orquestra a execução da ferramenta Git:
  ```bash
  git merge-file <path-do-arquivo-usuario.ts> <path-base-cache-v1.0.2.ts> <path-nova-versao-v1.1.0.ts> -L "Local Modifications" -L "Original v1.0.2" -L "Kaven Update v1.1.0"
  ```
  - **Exit Code 0:** O merge foi resolvido automaticamente com sucesso e o arquivo foi atualizado.
  - **Exit Code > 0 (Conflitos):** O CLI captura o status. O arquivo do usuário estará preenchido com marcadores de conflito. A operação continua para os próximos arquivos, mas a flag de conflitos da sessão de update é ativada.

### Fase 4: Restauração de Âncoras e Injeções
Modificações estruturais (como adições no `apps/api/src/app.ts` usando âncoras como `// [KAVEN_MODULE_IMPORTS]`) não passam por 3-Way Merge de arquivo completo, porque o usuário controla esse arquivo. Em vez disso, o sistema de injeção avalia o novo `module.json`. Se houver novas rotas ou providers a serem injetados, eles são inseridos respeitando o Anchor Guard (as âncoras, que são protegidas pelo Husky pre-commit hook).

### Fase 5: Pós-Update e Resolução
1. **Refresh do Cache Base:** A nova versão descompactada é movida para `.kaven/cache/modules/<module-name>-v1.1.0/`, tornando-se o novo BASE para futuros updates.
2. **Atualização do Manifesto:** A versão do módulo no `kaven.json` é atualizada.
3. **Feedback para o Usuário:** 
   - *Se sucesso total:* "✅ Módulo <module> atualizado com sucesso de v1.0.2 para v1.1.0."
   - *Se conflitos:* "⚠️ Módulo <module> atualizado, mas ocorreram conflitos de merge nos seguintes arquivos: \n - apps/api/src/modules/billing/services.ts \n\nPor favor, abra esses arquivos no seu editor para resolver os conflitos manualmente e, em seguida, faça o commit das alterações."

---

## 4. Modificações e Requisitos Arquiteturais Necessários

Para tornar este fluxo realidade, os seguintes componentes do ecossistema precisam ser estendidos:

### 1. Kaven Framework & Kaven Template
- **Diretório `.kaven`**: Deve ser adicionado ao `.gitignore` geral (com exceção do `kaven.json` e configurações visíveis). A pasta `.kaven/cache` deve ser estritamente ignorada para não inchar o repositório Git do usuário.
- **Anchor Guard (Husky):** Adicionar configuração nativa de Husky (`.husky/pre-commit`) que executa `kaven doctor --check-anchors`. Isso garante que o usuário não remova acidentalmente as âncoras estruturais necessárias para injeções em futuras atualizações.

### 2. Kaven CLI (`kaven-cli`)
- **Implementação do Gerenciador de Baseline:** A camada `ModuleManager` precisa passar a fazer backup dos arquivos não adulterados durante a ação de `install`.
- **Git Wrapper (`GitMergeService`):** Um módulo utilitário em TypeScript executando `spawn` ou `exec` para invocar o comando `git merge-file`.
- **Gerenciamento de Lifecycle de Upgrade:** Implementar a lógica de migração e leitura de um novo campo no `module.json` para permitir que módulos rodem scripts durante a transição.

### 3. Manifesto de Módulo (`module.json`)
Adoção de um novo campo opcional no schema do manifesto do módulo, permitindo scripts de upgrade caso dados e schemas precisem ser manipulados além da troca de arquivos texto:
```json
{
  "name": "kaven-payments",
  "version": "1.1.0",
  "upgrades": {
    "scripts": [
      { "from": "<=1.0.2", "script": "scripts/upgrade-to-v1.1.js" }
    ]
  }
}
```

---

## 5. Consequências e Impactos

### Positivas (Prós)
- **Fim da Sobrescrita Destrutiva:** Garante que o usuário nunca perderá código validamente feito ao aplicar uma atualização de um módulo que ele pagou ou baixou.
- **Padrão de Indústria:** Aproveitar a robustez e a confiabilidade das ferramentas nativas do Git em vez de criar um resolver de diff proprietário sujeito a edge-cases.
- **UX Familiar:** A experiência de resolução de conflitos é idêntica ao que um desenvolvedor faz diariamente entre branches, resultando em fricção de aprendizado zero para resolver o problema.

### Negativas (Contras / Trade-offs)
- **Aumento do Cache Local:** O CLI precisará armazenar backups locais (Baselines) da versão bruta do código dos módulos, o que ocupará alguns megabytes de espaço adicional na máquina.
- **Dependência Estrita ao Git:** O comando `update` não vai funcionar caso o ambiente do usuário não possua Git instalado e funcional no path (um cenário extremamente improvável para projetos deste tipo).
- **Risco com Mudanças Muito Dispersas:** Se o Kaven refatorar completamente a estrutura e classes de um módulo, haverá um número considerável de conflitos para o usuário avaliar. 

---

## 6. Documentação & Transparência

Este protocolo exigirá um esforço claro de comunicação. O README automático e a saída do console no `kaven init` e `kaven module install` devem sempre emitir o aviso educativo:

> "Seu código customizado em módulos é seguro. Ao atualizar módulos (`kaven update`), o Kaven realizará um merge inteligente para preservar sua lógica de negócios."