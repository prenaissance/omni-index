import { AtprotoDid } from "@atproto/oauth-client-node";
import {
  FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";
import { ExceptionSchema } from "~/common/payloads";
import { ProfileResponse } from "~/profile/payloads/profile-response";

const profileRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.addSchema(ProfileResponse);

  app.get(
    "",
    {
      onRequest: [app.verifyAuthenticated],
      schema: {
        tags: ["Profile"],
        response: {
          200: Type.Ref(ProfileResponse),
          404: Type.Ref(ExceptionSchema),
        },
      },
    },
    async (request, reply) => {
      const did = request.atproto.assertDid as AtprotoDid;
      const user = await app.users.repository.getByDid(did);
      if (!user) {
        return reply.code(404).send({
          message: "User data not stored in the database",
        });
      }
      const { handle, role, displayName, description, avatarUrl } = user;

      return {
        did,
        handle,
        role,
        displayName,
        description,
        avatarUrl,
      } satisfies ProfileResponse;
    }
  );
};

export default profileRoutes;
