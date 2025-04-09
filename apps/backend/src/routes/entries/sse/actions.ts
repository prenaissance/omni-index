import {
  FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";
import { EventMap, EventType } from "~/common/events/event-map";
import { HeartbeatEvent } from "~/common/events/heartbeat-event";
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
            Type.Ref(HeartbeatEvent),
          ]),
        },
      },
    },
    async (_request, reply) => {
      reply.raw.setHeader("Content-Type", "text/event-stream; charset=utf-8");
      reply.raw.setHeader("Connection", "keep-alive");
      reply.raw.setHeader("Cache-Control", "no-cache,no-transform");
      reply.raw.setHeader("Access-Control-Allow-Origin", "*");

      reply.raw.statusCode = 200;
      reply.raw.flushHeaders();
      const callback = (
        event: EventMap[MatchesPattern<"entry.*", EventType>]
      ) => {
        reply.log.debug({
          msg: "SSE event sent",
          event: event.type,
          remoteAddress: reply.raw.socket?.remoteAddress,
        });
        reply.sse({ data: JSON.stringify(event) });
      };

      app.eventEmitter.onPattern("entry.*", callback);
      const intervalId = setInterval(() => {
        reply.sse({ data: JSON.stringify({ type: "heartbeat" }) });
      }, 90_000);

      reply.raw.once("close", () => {
        app.eventEmitter.offPattern("entry.*", callback);
        clearInterval(intervalId);
        reply.log.debug({
          msg: "SSE connection closed",
          remoteAddress: reply.raw.socket?.remoteAddress,
        });
      });
    }
  );
};

export default entriesSseRoutes;
