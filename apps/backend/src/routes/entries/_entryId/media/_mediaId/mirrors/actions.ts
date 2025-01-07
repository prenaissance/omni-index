import {
  FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";
import { ObjectId } from "mongodb";
import { ExceptionSchema } from "~/common/payloads/exception-schema";
import { ObjectIdSchema } from "~/common/payloads/object-id-schema";
import { Index } from "~/media/entities";
import { EntrySchema } from "~/media/payloads/entry/entry-schema";
import { CreateIndexRequest } from "~/media/payloads/index/create-index-request";

const mirrorRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.post(
    "",
    {
      schema: {
        params: Type.Object({
          entryId: ObjectIdSchema({
            description: "ObjectId of the media entry",
          }),
          mediaId: ObjectIdSchema({
            description: "ObjectId of the media under the entry",
          }),
        }),
        body: Type.Array(Type.Ref(CreateIndexRequest)),
        response: {
          201: Type.Ref(EntrySchema),
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
      const media = entry.media.find((media) =>
        media._id.equals(new ObjectId(mediaId))
      );
      if (!media) {
        reply.status(404);
        return { message: `Media not found under entry ${entryId}` };
      }

      const newMirrors = request.body.map(Index.fromDocument);
      media.mirrors.push(...newMirrors);
      await app.mediaEntry.repository.save(entry);
      reply.status(201);
      return entry;
    }
  );

  app.delete(
    "/:mirrorId",
    {
      schema: {
        params: Type.Object({
          entryId: ObjectIdSchema({
            description: "ObjectId of the media entry",
          }),
          mediaId: ObjectIdSchema({
            description: "ObjectId of the media under the entry",
          }),
          mirrorId: ObjectIdSchema({
            description: "ObjectId of the mirror to delete",
          }),
        }),
        response: {
          200: Type.Ref(EntrySchema),
          404: Type.Ref(ExceptionSchema),
        },
      },
    },
    async (request, reply) => {
      const { entryId, mediaId, mirrorId } = request.params;
      const entry = await app.mediaEntry.repository.findOne(
        new ObjectId(entryId)
      );
      if (!entry) {
        reply.status(404);
        return { message: "Media entry not found" };
      }
      const media = entry.media.find((media) =>
        media._id.equals(new ObjectId(mediaId))
      );
      if (!media) {
        reply.status(404);
        return { message: `Media not found under entry ${entryId}` };
      }

      const mirrorIndex = media.mirrors.findIndex((mirror) =>
        mirror._id.equals(new ObjectId(mirrorId))
      );

      if (mirrorIndex === -1) {
        reply.status(404);
        return { message: `Mirror not found under media ${mediaId}` };
      }

      media.mirrors.splice(mirrorIndex, 1);
      await app.mediaEntry.repository.save(entry);
      return entry;
    }
  );
};

export default mirrorRoutes;
