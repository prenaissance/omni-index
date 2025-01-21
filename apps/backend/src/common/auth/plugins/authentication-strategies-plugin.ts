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
    if (!request.atproto.did) {
      return reply.code(401).send({
        message: "Unauthorized",
      });
    }
  });

  app.decorate("verifyRoles", (roles) => async (request, reply) => {
    if (!request.atproto.did) {
      return reply.code(401).send({
        message: "Unauthorized",
      });
    }
    const user = await app.users.repository.getByDid(
      // TODO: Remove cast when the library fixed this
      request.atproto.did as AtprotoDid
    );
    if (!user || !roles.includes(user.role)) {
      return reply.code(403).send({
        message: "Forbidden",
      });
    }
  });
});
