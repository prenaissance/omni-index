import {
  FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";
import { PaginationQuery } from "~/common/payloads/pagination/pagination-query";
import { StoredEventResponse } from "~/stored-events/payloads/stored-event-response";

const eventRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.addSchema(StoredEventResponse);

  app.get(
    "",
    {
      schema: {
        tags: ["Events"],
        querystring: Type.Ref(PaginationQuery),
        response: { 200: Type.Array(Type.Ref(StoredEventResponse)) },
      },
    },
    async (request) => {
      const { page = 1, limit = 10 } = request.query;
      const skip = (page - 1) * limit;
      const storedEvents = await app.storedEvents.repository.findMany(
        {},
        { skip, limit }
      );

      return storedEvents;
    }
  );
};

export default eventRoutes;
