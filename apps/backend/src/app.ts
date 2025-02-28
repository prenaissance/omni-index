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
import { envPlugin } from "./common/config/env-plugin";
import { commentsPayloadsPlugin } from "./media/comments/comment-payloads-plugin";
import type { PinoLoggerOptions } from "fastify/types/logger";
import { distributedLockPlugin } from "./common/distributed-lock/distributed-lock-plugin";

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const loggerEnvConfigs: Record<string, PinoLoggerOptions> = {
  development: {
    level: "debug",
    transport: {
      target: "pino-pretty",
      options: {
        ignore: "pid,hostname",
        translateTime: "HH:MM:ss",
      },
    },
  },
  test: {
    level: "warn",
    transport: {
      target: "pino-pretty",
      options: {
        ignore: "pid,hostname",
        translateTime: "HH:MM:ss",
      },
    },
  },
  production: {
    level: "info",
  },
};

/**
 * Builds the fastify application. Mainly used for e2e testing.
 * @returns Fastify instance which is not listening on any port.
 */
export const build = async () => {
  const app = Fastify({
    logger: loggerEnvConfigs[process.env.NODE_ENV!],
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

  app.register(envPlugin);
  app.register(mongodbPlugin);
  app.register(configPlugin);
  app.register(distributedLockPlugin);
  app.register(sessionSetupPlugin);
  app.register(authPlugin);
  app.register(atprotoOAuthPlugin);
  app.register(authenticationStrategiesPlugin);

  app.register(commonPayloadsPlugin);
  app.register(commentsPayloadsPlugin);
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

  return app;
};
