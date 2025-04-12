import {
  FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";
import { ObjectId } from "mongodb";
import { ExceptionSchema } from "~/common/payloads";
import { EntrySchema } from "~/media/payloads/entry/entry-schema";
import { UpdateEntryRequest } from "~/media/payloads/entry/update-entry-request";

const entryIdRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.get(
    "",
    {
      schema: {
        tags: ["Entries"],
        security: [],
        params: Type.Object({
          entryId: Type.String({
            description: "ObjectId of the media entry",
          }),
        }),
        response: {
          200: Type.Ref(EntrySchema),
          404: Type.Ref(ExceptionSchema),
        },
      },
    },
    async (request, reply) => {
      const { entryId } = request.params;
      const entry = await app.mediaEntry.repository.findOne(
        new ObjectId(entryId)
      );

      if (!entry) {
        reply.status(404);
        return {
          message: "Media entry not found",
        };
      }

      reply.send(entry);
    }
  );

  app.patch(
    "",
    {
      schema: {
        tags: ["Entries"],
        params: Type.Object({
          entryId: Type.String({
            description: "ObjectId of the media entry",
          }),
        }),
        body: Type.Ref(UpdateEntryRequest),
        response: {
          200: Type.Ref(EntrySchema),
          404: Type.Ref(ExceptionSchema),
        },
      },
    },
    async (request, reply) => {
      const { entryId } = request.params;
      const entry = await app.mediaEntry.repository.findOne(
        new ObjectId(entryId)
      );
      if (!entry) {
        reply.status(404);
        return {
          message: "Media entry not found",
        };
      }

      Object.assign(entry, request.body);
      entry.updatedAt = new Date();
      await app.mediaEntry.service.updateEntry(entry);

      return entry;
    }
  );

  app.delete(
    "",
    {
      schema: {
        tags: ["Entries"],
        params: Type.Object({
          entryId: Type.String({
            description: "ObjectId of the media entry",
          }),
        }),
        response: {
          204: Type.Null(),
          404: Type.Ref(ExceptionSchema),
        },
      },
    },
    async (request, reply) => {
      await app.mediaEntry.service.deleteEntry(
        new ObjectId(request.params.entryId)
      );
      return reply.status(204).send();
    }
  );
};

export default entryIdRoutes;
