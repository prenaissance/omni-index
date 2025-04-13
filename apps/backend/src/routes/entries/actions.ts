import {
  FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";
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
        security: [],
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

  app.post(
    "",
    {
      schema: {
        tags: ["Entries"],
        body: Type.Ref(CreateEntryRequest),
        response: {
          201: Type.Ref(EntrySchema),
          409: Type.Ref(ExceptionSchema),
        },
      },
    },
    async (request, reply) => {
      const entry = Entry.fromDocument(request.body);
      const isDuplicate = await app.mediaEntry.repository.hasSlug(entry.slug);
      if (isDuplicate) {
        return reply.status(409).send({
          message: `Entry ${entry.slug} already exists`,
        });
      }
      const createdEntry = await app.mediaEntry.service.createEntry(
        request.body
      );
      reply.status(201).send(createdEntry);
    }
  );
};

export default entryRoutes;
