import {
  FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";
import { PaginationQuery } from "~/common/payloads/pagination/pagination-query";
import { PaginatedStoredEventsResponse } from "~/stored-events/payloads/paginated-stored-events-response";
import { StoredEventResponse } from "~/stored-events/payloads/stored-event-response";

const eventRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.addSchema(StoredEventResponse);
  app.addSchema(PaginatedStoredEventsResponse);

  app.get(
    "",
    {
      schema: {
        tags: ["Events"],
        querystring: Type.Ref(PaginationQuery),
        response: { 200: Type.Ref(PaginatedStoredEventsResponse) },
      },
    },
    async (request) => {
      const { page = 1, limit = 10 } = request.query;
      const skip = (page - 1) * limit;
      const [storedEvents, total] = await Promise.all([
        app.storedEvents.repository.findMany(
          {},
          { skip, limit, sort: { createdAt: -1 } }
        ),
        app.storedEvents.repository.count({}),
      ]);

      return {
        events: storedEvents,
        total,
      };
    }
  );
};

export default eventRoutes;
