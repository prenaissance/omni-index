import {
  FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";
import { ObjectId } from "mongodb";
import { Entry } from "~/media/entities/entry";
import { BlobLinkSchema } from "~/media/payloads/blob-link-schema";
import { CreateEntryRequest } from "~/media/payloads/create-entry-schema";
import { EntrySchema } from "~/media/payloads/entry-schema";
import { IndexSchema } from "~/media/payloads/index-schema";
import { MediaSchema } from "~/media/payloads/media-schema";

const mediaRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.addSchema(BlobLinkSchema);
  app.addSchema(IndexSchema);
  app.addSchema(MediaSchema);
  app.addSchema(EntrySchema);
  app.addSchema(CreateEntryRequest);
  app.get(
    "/:id",
    {
      schema: {
        params: Type.Object({
          id: Type.String({
            description: "ObjectId of the media entry",
          }),
        }),
        response: {
          200: EntrySchema,
          404: Type.Null(),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const media = await Entry.getCollection(app.db).findOne({
        _id: new ObjectId(id),
      });

      if (!media) {
        reply.status(404);
        return;
      }

      reply.send(media as never);
    }
  );
};

export default mediaRoutes;
