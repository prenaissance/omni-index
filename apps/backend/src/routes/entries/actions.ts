import {
  FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";
import { ObjectId } from "mongodb";
import { ExceptionSchema } from "~/common/payloads/exception-schema";
import { PaginationQuery } from "~/common/payloads/pagination/pagination-query";
import { PaginatedResponse } from "~/common/payloads/pagination/pagination-response";
import { Entry } from "~/media/entities/entry";
import { CreateEntryRequest } from "~/media/payloads/entry/create-entry-request";
import { EntrySchema } from "~/media/payloads/entry/entry-schema";

const entryRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.get(
    "",
    {
      schema: {
        tags: ["Entries"],
        querystring: Type.Ref(PaginationQuery),
        response: {
          200: PaginatedResponse(Type.Ref(EntrySchema)),
        },
      },
    },
    async (request) => {
      const { page = 1, limit = 10 } = request.query;
      const skip = (page - 1) * limit;

      const { entries, total } = await app.mediaEntry.repository.findMany({
        skip,
        limit,
      });

      return {
        data: entries,
        meta: {
          total,
          page,
          limit,
        },
      };
    }
  );

  app.get(
    "/:id",
    {
      schema: {
        tags: ["Entries"],
        params: Type.Object({
          id: Type.String({
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
      const { id } = request.params;
      const media = await app.mediaEntry.repository.findOne(new ObjectId(id));

      if (!media) {
        reply.status(404);
        return {
          message: "Media entry not found",
        };
      }

      reply.send(media);
    }
  );

  app.post(
    "",
    {
      schema: {
        tags: ["Entries"],
        body: Type.Ref(CreateEntryRequest),
        response: {
          201: Type.Ref(EntrySchema),
        },
      },
    },
    async (request, reply) => {
      const entry = Entry.fromDocument(request.body);
      await app.mediaEntry.repository.save(entry);
      reply.status(201).send(entry);
    }
  );
};

export default entryRoutes;
