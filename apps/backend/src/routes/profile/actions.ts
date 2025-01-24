import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";

const profileRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.get(
    "",
    {
      onRequest: [app.verifyAuthenticated],
      schema: {
        tags: ["Profile"],
      },
    },
    async (request) => {
      const response = await request.atproto.getProfile({
        actor: request.atproto.assertDid,
      });
      return response.data;
    }
  );
};

export default profileRoutes;
