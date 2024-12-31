import {
  FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";
import { ObjectId } from "mongodb";
import { Entry } from "~/media/entities/entry";
import { mediaPayloadsPlugin } from "~/media/payloads/_plugin";
import { CreateEntryRequest } from "~/media/payloads/create-entry-request";
import { EntrySchema } from "~/media/payloads/entry-schema";

const mediaRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.register(mediaPayloadsPlugin);

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
          200: Type.Ref(EntrySchema),
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

  app.post(
    "/",
    {
      schema: {
        body: Type.Ref(CreateEntryRequest),
        response: {
          201: Type.Ref(EntrySchema),
        },
      },
    },
    async (request, reply) => {
      const entry = Entry.fromDocument(request.body);
      const collection = Entry.getCollection(app.db);
      await collection.insertOne(entry);
      reply.status(201).send(entry);
    }
  );
};

export default mediaRoutes;
