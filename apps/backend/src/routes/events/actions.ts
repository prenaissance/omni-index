import {
  FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";
import { Filter } from "mongodb";
import { StoredEvent } from "~/stored-events/entities/stored-event";
import { PaginatedStoredEventsQuery } from "~/stored-events/payloads/paginated-stored-events-query";
import { PaginatedStoredEventsResponse } from "~/stored-events/payloads/paginated-stored-events-response";
import { StoredEventResponse } from "~/stored-events/payloads/stored-event-response";

const eventRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.addSchema(StoredEventResponse);
  app.addSchema(PaginatedStoredEventsQuery);
  app.addSchema(PaginatedStoredEventsResponse);

  app.get(
    "",
    {
      schema: {
        tags: ["Events"],
        querystring: Type.Ref(PaginatedStoredEventsQuery),
        response: { 200: Type.Ref(PaginatedStoredEventsResponse) },
      },
    },
    async (request) => {
      const { page = 1, limit = 10 } = request.query;
      const statuses =
        request.query.statuses === undefined
          ? undefined
          : Array.isArray(request.query.statuses)
            ? request.query.statuses
            : [request.query.statuses];
      const skip = (page - 1) * limit;
      const filter: Filter<StoredEvent> = {};
      if (statuses) {
        filter.status = {
          $in: statuses,
        };
      }
      const [storedEvents, total] = await Promise.all([
        app.storedEvents.repository.findMany(filter, {
          skip,
          limit,
          sort: { createdAt: -1 },
        }),
        app.storedEvents.repository.count(filter),
      ]);

      return {
        events: storedEvents,
        total,
      };
    }
  );
};

export default eventRoutes;
