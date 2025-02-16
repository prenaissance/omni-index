import { AtprotoDid } from "@atproto/oauth-client-node";
import {
  FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";
import { ObjectId } from "mongodb";
import {
  AtprotoDeletionResponse,
  ExceptionSchema,
  ObjectIdSchema,
} from "~/common/payloads";

const entryCommentTidRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.delete(
    "",
    {
      schema: {
        tags: ["Entries", "Comments"],
        onRequest: app.auth([app.verifyAuthenticated]),
        params: Type.Object({
          entryId: ObjectIdSchema({
            description: "ObjectId of the media entry",
          }),
          tid: Type.String({
            description: "Comment tid",
          }),
        }),
        response: {
          200: Type.Ref(AtprotoDeletionResponse),
          404: Type.Ref(ExceptionSchema),
        },
      },
    },
    async (request, reply) => {
      const { entryId, tid } = request.params;
      const entry = await app.mediaEntry.repository.findOne(
        new ObjectId(entryId)
      );
      if (!entry) {
        return reply.code(404).send({
          message: "Entry not found",
        });
      }

      const deleteLocally = () =>
        app.mediaEntry.comments.repository.deleteOne({
          entrySlug: entry.slug,
          tid,
          createdByDid: request.atproto.assertDid as AtprotoDid,
        });

      const deleteAtproto = async () => {
        const response = await request.atproto.com.atproto.repo.deleteRecord({
          repo: request.atproto.assertDid,
          collection: "com.omni-index.comment",
          rkey: tid,
        });

        return "commit" in response.data;
      };

      const [locallyDeleted, atprotoDeleted] = await Promise.all([
        deleteLocally(),
        deleteAtproto(),
      ]);
      return { locallyDeleted, atprotoDeleted };
    }
  );
};

export default entryCommentTidRoutes;
