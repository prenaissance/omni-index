import { fastifyPlugin } from "fastify-plugin";
import type { FastifyAuthFunction } from "@fastify/auth";

declare module "fastify" {
  interface FastifyInstance {
    verifyAuthenticated: FastifyAuthFunction;
    verifyPermissions: (permissions: string[]) => FastifyAuthFunction;
  }
  interface FastifyRequest {
    identity: any;
  }
}

const authenticationStrategies = fastifyPlugin(async (app) => {
  app.decorate("verifyAuthenticated", async (request, reply, done) => {
    if (!request.headers.authorization) {
      return await reply.code(401).send({
        message: "Unauthorized",
      });
    }
    const data = app.jwt.verify<any>(
      request.headers.authorization.replace("Bearer ", "")
    );
    if (!data) {
      return await reply.code(401).send({
        message: "Unauthorized",
      });
    }

    request.identity = {
      sub: data.sub,
      permissions: data.permissions,
    };

    done();
  });

  app.decorate("verifyPermissions", (permissions: string[]) => {
    return async (request, reply, done) => {
      if (!request.headers.authorization) {
        return await reply.code(401).send({
          message: "Unauthorized",
        });
      }
      const data = app.jwt.verify<any>(
        request.headers.authorization.replace("Bearer ", "")
      );
      if (!data) {
        return await reply.code(401).send({
          message: "Unauthorized",
        });
      }

      if (
        !permissions.every((permission) =>
          data.permissions.includes(permission)
        )
      ) {
        return await reply.code(403).send({
          message: "Forbidden",
        });
      }

      request.identity = {
        sub: data.sub,
        permissions: data.permissions,
      };

      done();
    };
  });
});

export default authenticationStrategies;
