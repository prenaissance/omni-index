import { Type } from "@sinclair/typebox";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { isValidHandle } from "@atproto/syntax";
import { Agent } from "@atproto/api";

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

const oauthRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.addSchema(LoginRequestSchema);
  app.post(
    "/login",
    {
      schema: {
        tags: ["Auth"],
        security: [],
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
        tags: ["Auth"],
        security: [],
        querystring: Type.Object(
          {
            code: Type.String(),
            state: Type.String(),
            iss: Type.String(),
          },
          { additionalProperties: true }
        ),
      },
    },
    async (request, reply) => {
      const { session } = await app.oauth.client.callback(
        new URLSearchParams(request.query)
      );
      const { did } = session;
      request.log.debug({ msg: "Authenticated", did });
      request.session.set("did", did);

      let user = await app.users.repository.getByDid(did);
      if (!user) {
        const atprotoClient = new Agent(session);
        user = await app.users.service.importUser(did, atprotoClient);
        request.log.info({ msg: "Created user on first log in", did });
        await app.mediaEntry.comments.service.importCommentLikes(
          did,
          atprotoClient
        );
        await app.mediaEntry.comments.service.importComments(
          did,
          atprotoClient
        );
      }

      return reply.redirect(app.env.FRONTEND_URL);
    }
  );

  app.post("/logout", {
    schema: {
      tags: ["Auth"],
      security: [],
      response: {
        200: Type.Null(),
      },
    },
    handler: async (request, reply) => {
      request.session.delete();
      if (request.atproto.did) {
        await app.oauth.sessionStore.del(request.atproto.did);
      }
      return reply.status(200).send();
    },
  });
};

export default oauthRoutes;
