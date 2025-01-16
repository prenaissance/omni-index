import { fastifyPlugin } from "fastify-plugin";
import type { FastifyAuthFunction } from "@fastify/auth";
import { type AtprotoDid } from "@atproto/oauth-client-node";
import { UserRole } from "../entities/enums/user-role";

export type JwtPayload = {
  sub: AtprotoDid;
  role: UserRole;
};

declare module "fastify" {
  interface FastifyInstance {
    verifyAuthenticated: FastifyAuthFunction;
    /** Verifies that the user matches one of the provided roles */
    verifyRoles: (roles: readonly UserRole[]) => FastifyAuthFunction;
  }
  interface FastifyRequest {
    user: JwtPayload;
  }
}

export const authenticationStrategiesPlugin = fastifyPlugin(async (app) => {
  app.decorate("verifyAuthenticated", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (_err) {
      return reply.code(401).send({
        message: "Unauthorized",
      });
    }
  });

  app.decorate("verifyRoles", (roles) => async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (_err) {
      return reply.code(401).send({
        message: "Unauthorized",
      });
    }

    if (!roles.includes(request.user.role)) {
      return await reply.code(403).send({
        message: "Forbidden",
      });
    }
  });
});
