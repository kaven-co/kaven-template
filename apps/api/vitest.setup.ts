// Priorizar DATABASE_URL do ambiente (CI) sobre fallback local
// No CI, DATABASE_URL já está definida no workflow
// Localmente, usa default do docker-compose
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    "postgresql://kaven:kaven_dev_password_123@localhost:5433/kaven_dev";
}
if (!process.env.REDIS_URL) {
  process.env.REDIS_URL = "redis://localhost:6380";
}
if (!process.env.REDIS_HOST) {
  process.env.REDIS_HOST = "localhost";
}
if (!process.env.REDIS_PORT) {
  process.env.REDIS_PORT = "6380";
}
process.env.JWT_SECRET = "test-jwt-secret-must-be-at-least-32-chars-long";
process.env.API_URL = "http://localhost:3000";
process.env.APP_URL = "http://localhost:3000";
// NODE_ENV is usually set by test runner
process.env.PORT = "3000";
process.env.SEED_DEFAULT_PASSWORD = "Dev@123456";
process.env.SMTP_HOST = "smtp.example.com";
process.env.SMTP_PORT = "587";
process.env.SMTP_USER = "user";
process.env.SMTP_PASS = "pass";
process.env.SMTP_FROM = "noreply@example.com";
process.env.REFRESH_TOKEN_SECRET =
  "test-refresh-secret-must-be-at-least-32-chars-long";
process.env.ENCRYPTION_KEY =
  "test-encryption-key-must-be-at-least-32-chars-long";
process.env.STRIPE_SECRET_KEY = "sk_test_123";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_123";

// AWS SES (test defaults)
if (!process.env.AWS_SES_REGION) {
  process.env.AWS_SES_REGION = "us-east-1";
}
if (!process.env.AWS_SES_ACCESS_KEY_ID) {
  process.env.AWS_SES_ACCESS_KEY_ID = "test-access-key-id";
}
if (!process.env.AWS_SES_SECRET_ACCESS_KEY) {
  process.env.AWS_SES_SECRET_ACCESS_KEY = "test-secret-access-key";
}
if (!process.env.AWS_SES_FROM_EMAIL) {
  process.env.AWS_SES_FROM_EMAIL = "noreply@test.kaven.com";
}
