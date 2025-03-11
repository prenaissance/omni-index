import { once } from "node:events";
import {
  FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";
import { EventMap, EventType } from "~/common/events/event-map";
import { MatchesPattern } from "~/common/types/strings";
import {
  EntryCreatedEvent,
  EntryDeletedEvent,
  EntryUpdatedEvent,
} from "~/media/events/entry";

const entriesSseRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.addSchema(EntryCreatedEvent);
  app.addSchema(EntryUpdatedEvent);
  app.addSchema(EntryDeletedEvent);

  app.get(
    "",
    {
      schema: {
        tags: ["SSE"],
        security: [],
        produces: ["text/event-stream"],
        response: {
          200: Type.Union([
            Type.Ref(EntryCreatedEvent),
            Type.Ref(EntryUpdatedEvent),
            Type.Ref(EntryDeletedEvent),
          ]),
        },
      },
    },
    async (_request, reply) => {
      reply.raw.setHeader("Content-Type", "text/event-stream; charset=utf-8");
      reply.raw.setHeader("Connection", "keep-alive");
      reply.raw.setHeader("Cache-Control", "no-cache,no-transform");
      reply.raw.setHeader("x-no-compression", 1);

      const callback = (
        event: EventMap[MatchesPattern<"entry.*", EventType>]
      ) => {
        reply.sse({ data: JSON.stringify(event) });
      };

      app.eventEmitter.onPattern("entry.*", callback);

      reply.raw.flushHeaders();

      await once(reply.raw, "close");

      app.eventEmitter.offPattern("entry.*", callback);
    }
  );
};

export default entriesSseRoutes;
