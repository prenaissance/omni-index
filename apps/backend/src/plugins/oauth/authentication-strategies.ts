import { fastifyPlugin } from "fastify-plugin";
import type { FastifyAuthFunction } from "@fastify/auth";
import { type AtprotoDid } from "@atproto/oauth-client-node";

declare module "@fastify/secure-session" {
  interface SessionData {
    did: AtprotoDid;
  }
}

export type RequestUser = unknown;

declare module "fastify" {
  interface FastifyInstance {
    verifyAuthenticated: FastifyAuthFunction;
    verifyPermissions: (permissions: string[]) => FastifyAuthFunction;
  }
  interface FastifyRequest {
    identity: RequestUser;
  }
}

const authenticationStrategies = fastifyPlugin(async (app) => {
  app.decorate("verifyAuthenticated", async (request, reply, done) => {
    if (!request.atproto) {
      return await reply.code(401).send({
        message: "Unauthorized",
      });
    }
    done();
  });

  app.decorate("verifyPermissions", (permissions: string[]) => {
    return async (request, reply, done) => {
      if (!request.atproto) {
        return await reply.code(401).send({
          message: "Unauthorized",
        });
      }

      if (
        // TODO: Add permissions from DB
        // eslint-disable-next-line no-constant-condition
        false
      ) {
        return await reply.code(403).send({
          message: "Forbidden",
        });
      }

      done();
    };
  });
});

export default authenticationStrategies;
