-- LGPD P0: UserConsentRecord — sistema de consentimento de usuários por finalidade
-- Débito: lgpd-consent-system-gap
-- Refs: LGPD Art. 7 (hipóteses de tratamento), Art. 8 (consentimento livre/informado/específico),
--       Art. 9 (direito à informação), Art. 18-IX (direito de revogar consentimento)

CREATE TABLE IF NOT EXISTS "user_consent_records" (
  "id"           TEXT NOT NULL,
  "user_id"      TEXT NOT NULL,
  "tenant_id"    TEXT NOT NULL,
  "purpose"      TEXT NOT NULL,   -- ex: 'platform_usage', 'analytics', 'marketing', 'third_party_sharing'
  "version"      TEXT NOT NULL,   -- versão da política (ex: '2026-01')
  "consented_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revoked_at"   TIMESTAMP(3),    -- null = consentimento ativo
  "ip_address"   TEXT,
  "user_agent"   TEXT,

  CONSTRAINT "user_consent_records_pkey" PRIMARY KEY ("id")
);

-- FK: user
ALTER TABLE "user_consent_records"
  ADD CONSTRAINT "user_consent_records_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- FK: tenant
ALTER TABLE "user_consent_records"
  ADD CONSTRAINT "user_consent_records_tenant_id_fkey"
  FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- Unique: um registro por (user, purpose, version) — novo aceite cria novo registro
CREATE UNIQUE INDEX IF NOT EXISTS "user_consent_records_userId_purpose_version_key"
  ON "user_consent_records" ("user_id", "purpose", "version");

-- Indexes
CREATE INDEX IF NOT EXISTS "user_consent_records_user_id_purpose_idx"
  ON "user_consent_records" ("user_id", "purpose");

CREATE INDEX IF NOT EXISTS "user_consent_records_tenant_id_idx"
  ON "user_consent_records" ("tenant_id");

CREATE INDEX IF NOT EXISTS "user_consent_records_tenant_id_purpose_idx"
  ON "user_consent_records" ("tenant_id", "purpose");

CREATE INDEX IF NOT EXISTS "user_consent_records_revoked_at_idx"
  ON "user_consent_records" ("revoked_at")
  WHERE "revoked_at" IS NOT NULL;
