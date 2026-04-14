# Contrato de Envs de Produção — Kaven Ecosystem

> **Objetivo**: evitar drift de variáveis entre **Vercel**, **Cloud Run** e **GitHub Actions**.
> A regra é simples: **código valida o contrato**, e infra só injeta valores.
>
> **Sem secrets**: este documento só define **nomes** e **onde** cada env deve existir.

---

## 1) Fontes de verdade (onde olhar)

- **Vercel linking**: `.vercel/project.json` (por projeto) — prova de vínculo, não contém envs.
- **Cloud Run runtime**: deploy via `--env-vars-file` (ex.: `/tmp/kaven-marketplace-env.yaml`).
  - Fonte: `docs/architecture/infra-map.md`
- **Workflows (GitHub Actions)**: secrets referenciados nos YAMLs.
  - Fonte: `.github/workflows/*.yml`
- **Checklist de deploy** (nomes esperados): `docs/planning/PRODUCTION-DEPLOY-PLAN.md`

---

## 2) Mapa por sistema

### 2.1 `kaven-framework` (Vercel)

**Apps**: `apps/admin`, `apps/tenant`, `apps/docs`

- **Obrigatórias**:
  - `NEXT_PUBLIC_API_URL` (aponta para o Cloud Run do `apps/api`)

Fonte: `docs/architecture/infra-map.md` (seção “Variáveis críticas (Vercel)”).

---

### 2.2 `kaven-marketplace` (Cloud Run)

> **Atenção**: o marketplace agora tem **hard gates em produção** (se faltar env, não sobe).

#### Runtime (Cloud Run)

- **Database / JWT**:
  - `DATABASE_URL`
  - `JWT_SECRET`

- **Storage (S3 compat)**:
  - `AWS_REGION`
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `S3_BUCKET_NAME`
  - `S3_ENDPOINT` (opcional)
  - `S3_ALLOWED_DOMAINS` (opcional, recomendado)

- **Signing (produção)**:
  - `SIGNING_PRIVATE_KEY`
  - `SIGNING_PUBLIC_KEY`

- **Internal publishing (produção)**:
  - `INTERNAL_SERVICE_TOKEN`

- **Docs/UI**:
  - `DOCS_ENABLED` (default `true`)

Fontes:
- `docs/architecture/infra-map.md` (deploy Cloud Run + S3 bucket)
- `docs/planning/PRODUCTION-DEPLOY-PLAN.md` (lista de envs esperadas)
- Código do marketplace (validação em runtime)

#### CI (GitHub Actions) — publish interno

Workflows de publish usam **GitHub Secrets** com estes nomes canônicos:
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET_NAME` (+ `S3_ENDPOINT` opcional)
- `SIGNING_PRIVATE_KEY_PEM`
- `MARKETPLACE_BASE_URL`
- `MARKETPLACE_INTERNAL_SERVICE_TOKEN`

Regra de mapeamento:
- `MARKETPLACE_INTERNAL_SERVICE_TOKEN` (secret no GitHub) → header `X-Internal-Token` → valida no Cloud Run via `INTERNAL_SERVICE_TOKEN`.

Fonte: workflow “Marketplace publish module”.

---

## 3) Anti-drift (checklist)

- **Nome único**: AWS creds devem ser sempre `AWS_*` (não `S3_ACCESS_KEY_ID`, etc.).
- **Prod hard gates**: se o serviço roda em produção, ele deve falhar ao subir sem env crítica.
- **Publish interno**:
  - GitHub Secrets e Cloud Run env precisam estar sincronizados (`INTERNAL_SERVICE_TOKEN`).
- **Sem placeholders**: `artifactUrl` em releases internos deve ser `s3://...`.

---

## 4) Procedimento recomendado (operacional)

1) **Vercel**:
   - `vercel link`
   - `vercel env pull .env.local` (somente dev local)
2) **Cloud Run**:
   - manter um arquivo `kaven-marketplace-env.yaml` gerado a partir deste contrato
3) **GitHub Actions**:
   - configurar secrets listados acima no repo certo

