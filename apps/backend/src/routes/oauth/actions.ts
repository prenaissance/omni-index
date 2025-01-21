import { Type } from "@sinclair/typebox";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { isValidHandle } from "@atproto/syntax";
import { env } from "~/common/config/env";
import { User } from "~/common/auth/entities/user";
import { UserRole } from "~/common/auth/entities/enums/user-role";

const LoginRequestSchema = Type.Object(
  {
    handle: Type.String({
      description: "User handle. Example: @example.bsky.social",
    }),
  },
  {
    $id: "LoginRequestSchema",
  }
);

const LoginResponseSchema = Type.Object(
  {
    token: Type.String({ description: "JWT token" }),
  },
  {
    $id: "LoginResponseSchema",
  }
);

const oauthRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.addSchema(LoginRequestSchema);
  app.addSchema(LoginResponseSchema);
  app.post(
    "/login",
    {
      schema: {
        tags: ["auth"],
        body: Type.Ref(LoginRequestSchema),
        response: {
          302: Type.Null(),
          404: Type.Object({
            message: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { handle } = request.body;
      if (!isValidHandle(handle)) {
        return reply.code(404).send({
          message: "Invalid handle",
        });
      }

      try {
        const url = await app.oauth.client.authorize(handle, {
          scope: "atproto transition:generic",
        });
        return reply.redirect(url.toString());
      } catch (error) {
        request.log.error({ error }, "Failed to authorize");
        return {
          message: "Failed to authorize",
        };
      }
    }
  );

  app.get(
    "/callback",
    {
      schema: {
        tags: ["auth"],
      },
    },
    async (request, reply) => {
      const { session } = await app.oauth.client.callback(
        new URLSearchParams(request.query as Record<string, string>)
      );
      const { did } = session;
      request.log.info("Authenticated", { did });
      request.session.set("did", did);

      let user = await app.users.repository.getByDid(did);
      if (!user) {
        user = new User({
          did,
          role: UserRole.User,
        });
        await app.users.repository.save(user);
        request.log.info("Created user on first log in", { did });
      }

      return reply.redirect(env.FRONTEND_URL);
    }
  );
};

export default oauthRoutes;
