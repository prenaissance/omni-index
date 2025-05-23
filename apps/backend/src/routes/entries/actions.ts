import {
  FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";
import { ExceptionSchema } from "~/common/payloads/exception-schema";
import { PaginatedResponse } from "~/common/payloads/pagination/pagination-response";
import { Entry } from "~/media/entities/entry";
import { CreateEntryRequest } from "~/media/payloads/entry/create-entry-request";
import { EntrySchema } from "~/media/payloads/entry/entry-schema";
import { PaginatedEntriesRequest } from "~/media/payloads/entry/paginated-entries-request";

const entryRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.get(
    "",
    {
      schema: {
        tags: ["Entries"],
        security: [],
        querystring: Type.Ref(PaginatedEntriesRequest),
        response: {
          200: PaginatedResponse(Type.Ref(EntrySchema)),
        },
      },
    },
    async (request) => {
      const { page = 1, limit = 10, author, search, orderBy } = request.query;
      const skip = (page - 1) * limit;

      const { entries, total } = await app.mediaEntry.repository.findMany({
        skip,
        limit,
        author,
        search,
        orderBy,
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

  app.get(
    "/genres",
    {
      schema: {
        tags: ["Entries"],
        security: [],
        response: {
          200: Type.Array(Type.String()),
        },
      },
    },
    async () => {
      const genres = await app.mediaEntry.repository.findGenres();
      return genres;
    }
  );
};

export default entryRoutes;
