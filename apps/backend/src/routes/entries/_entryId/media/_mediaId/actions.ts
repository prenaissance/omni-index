import {
  FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";
import { ObjectId } from "mongodb";
import { ExceptionSchema, ObjectIdSchema } from "~/common/payloads";
import { EntrySchema } from "~/media/payloads/entry/entry-schema";

const mediaRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.delete(
    "/:mediaId",
    {
      schema: {
        tags: ["Entries"],
        params: Type.Object({
          entryId: ObjectIdSchema({
            description: "ObjectId of the media entry",
          }),
          mediaId: ObjectIdSchema({
            description: "ObjectId of the media",
          }),
        }),
        response: {
          200: Type.Ref(EntrySchema),
          404: Type.Ref(ExceptionSchema),
        },
      },
    },
    async (request, reply) => {
      const { entryId, mediaId } = request.params;
      const entry = await app.mediaEntry.repository.findOne(
        new ObjectId(entryId)
      );
      if (!entry) {
        reply.status(404);
        return { message: "Media entry not found" };
      }
      const mediaIndex = entry.media.findIndex((media) =>
        media._id.equals(new ObjectId(mediaId))
      );
      if (mediaIndex === -1) {
        reply.status(404);
        return { message: "Media not found" };
      }
      entry.media.splice(mediaIndex, 1);
      await app.mediaEntry.repository.save(entry);
      return entry;
    }
  );
};

export default mediaRoutes;
