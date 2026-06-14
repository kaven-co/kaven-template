import { defineConfig, env } from "prisma/config";

/**
 * Prisma 7 Configuration
 * Centralizes configuration for the Prisma CLI.
 */
export default defineConfig({
  schema: "packages/database/prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
