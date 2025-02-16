import path from "node:path";
import Fastify from "fastify";
import { Type, TypeBoxTypeProvider } from "@fastify/type-provider-typebox";

import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";
import autoLoadPlugin from "@fastify/autoload";
import corsPlugin from "@fastify/cors";
import authPlugin from "@fastify/auth";
import fastifyRacingPlugin from "fastify-racing";
import formbodyPlugin from "@fastify/formbody";
import { env } from "./common/config/env";
import { commonPayloadsPlugin } from "./common/payloads/_plugin";
import { mediaPlugin } from "./media/_plugin";
import { eventEmitterPlugin } from "./common/events/_plugin";
import { mongodbPlugin } from "./common/mongodb/plugins/mongodb-plugin";
import { peerNodePlugin } from "./synchronization/plugins/peer-node-plugin";
import { verifiedRequestPlugin } from "./synchronization/plugins/verified-request-plugin";
import { storedEventPlugin } from "./stored-events/stored-event-plugin";
import { configPlugin } from "./common/config/config-plugin";
import {
  atprotoOAuthPlugin,
  authenticationStrategiesPlugin,
  sessionSetupPlugin,
  usersPlugin,
} from "./common/auth/plugins";
import { swaggerConfig } from "./common/config/boot/swagger-config";

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const app = Fastify({
  logger: {
    level: env.NODE_ENV === "development" ? "debug" : "info",
  },
}).withTypeProvider<TypeBoxTypeProvider>();

app.register(corsPlugin, {
  origin: "https://prenaissance.github.io",
  credentials: true,
});

app.register(formbodyPlugin);

app.register(fastifyRacingPlugin, {
  handleError: true,
});

await app.register(fastifySwagger, swaggerConfig);

app.register(fastifySwaggerUi, {
  routePrefix: "/swagger",
});

app.register(mongodbPlugin);
app.register(configPlugin);
app.register(sessionSetupPlugin);
app.register(authPlugin);
app.register(atprotoOAuthPlugin);
app.register(authenticationStrategiesPlugin);

app.register(commonPayloadsPlugin);
app.register(eventEmitterPlugin);
app.register(usersPlugin);
app.register(mediaPlugin);
app.register(peerNodePlugin);
app.register(verifiedRequestPlugin);
app.register(storedEventPlugin);

app.register(autoLoadPlugin, {
  dir: path.join(__dirname, "routes"),
  routeParams: true,
  options: { prefix: "/api" },
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
  app.get(
    "/shallow-ping",
    {
      schema: {
        tags: ["Health"],
        security: [],
        response: {
          200: Type.Literal("pong"),
        },
      },
    },
    async () => {
      return "pong" as const;
    }
  );
});

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    const address = app.server.address();
    if (typeof address !== "string") return;

    app.log.info(`server listening on ${address}`);
  });

await app.ready();

app.swagger();
