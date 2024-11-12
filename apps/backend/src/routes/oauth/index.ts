import { Type } from "@sinclair/typebox";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { isValidHandle } from "@atproto/syntax";
import { env } from "~/env";

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

const authRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.addSchema(LoginRequestSchema);
  app.addSchema(LoginResponseSchema);
  app.post(
    "/login",
    {
      schema: {
        body: Type.Ref(LoginRequestSchema),
        response: {
          // 200: Type.Ref(LoginResponseSchema),
          404: Type.Object({
            message: Type.String(),
          }),
          422: Type.Object({
            message: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { handle } = request.body;
      if (!isValidHandle(handle)) {
        return reply.code(422).send({
          message: "Invalid handle",
        });
      }

      try {
        const url = await app.oauth.authorize(handle, {
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

  app.get("/callback", async (request, reply) => {
    const { session } = await app.oauth.callback(
      new URLSearchParams(request.query as Record<string, string>)
    );
    const { did } = session;
    request.session.set("did", did);

    return reply.redirect(env.FRONTEND_URL);
  });
};

export default authRoutes;
