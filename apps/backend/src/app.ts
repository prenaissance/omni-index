import path from "path";
import Fastify from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";

import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import autoLoadPlugin from "@fastify/autoload";
import corsPlugin from "@fastify/cors";
import jwtPlugin from "@fastify/jwt";
import mongodbPlugin from "@fastify/mongodb";
import authPlugin from "@fastify/auth";

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const app = Fastify({
  logger: true,
}).withTypeProvider<TypeBoxTypeProvider>();

app.register(corsPlugin, {
  origin: "https://prenaissance.github.io",
  credentials: true,
});

app.register(jwtPlugin, {
  secret: process.env.JWT_SECRET!,
});

app.register(mongodbPlugin, {
  url: process.env.MONGODB_URI,
  database: "inventory-manager",
  forceClose: true,
});

app.register(authPlugin);

await app.register(fastifySwagger, {
  swagger: {
    info: {
      title: "Fastify API",
      description: "Backend API for Inventory Manager",
      version: "0.1.0",
    },
  },
  openapi: {
    components: {
      securitySchemes: {
        jwt: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ jwt: [] }],
  },
});

app.register(autoLoadPlugin, {
  dir: path.join(__dirname, "plugins"),
});

app.register(autoLoadPlugin, {
  dir: path.join(__dirname, "routes"),
  options: { prefix: "/api" },
});

app.register(fastifySwaggerUi, {
  routePrefix: "/swagger",
});

// graceful shutdown
const listeners = ["SIGINT", "SIGTERM"] as const;
listeners.forEach((signal) => {
  process.on(signal, async () => {
    await app.close();
    process.exit(0);
  });
});

app.after(() => {
  app.get("/shallow-ping", async () => {
    return "pong";
  });
});

app
  .listen({
    port: process.env.PORT ? Number(process.env.PORT) : 8080,
  })
  .then(() => {
    const address = app.server.address();
    if (typeof address !== "string") return;

    app.log.info(`server listening on ${address}`);
  });

await app.ready();

app.swagger();
