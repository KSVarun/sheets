import cors from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import Fastify from "fastify";
import { health } from "./routes/health.js";
import { sheets } from "./routes/sheets.js";
import { google } from "googleapis";

const fastify = Fastify({
  logger: true,
});
fastify.register(fastifyMultipart);
fastify.register(sheets);
fastify.register(health);

await fastify.register(cors, {
  origin: "*",
  optionsSuccessStatus: 200,
});

const start = async () => {
  try {
    await fastify.listen({ port: 8082, host: "10.80.201.112" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
