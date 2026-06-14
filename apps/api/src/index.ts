import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";

// [KAVEN_MODULE_IMPORTS]

const app = Fastify({
  logger: process.env.NODE_ENV !== "test",
});

await app.register(cors, {
  origin: process.env.ALLOWED_ORIGINS?.split(",") ?? ["http://localhost:3000"],
  credentials: true,
});

await app.register(helmet, { global: true });

app.get("/api/health", async () => ({ status: "ok", timestamp: new Date().toISOString() }));

// [KAVEN_MODULE_ROUTES]

const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? "0.0.0.0";

try {
  await app.listen({ port, host });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
