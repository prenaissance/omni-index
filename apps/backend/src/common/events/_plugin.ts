import { fastifyPlugin } from "fastify-plugin";
import { DomainEventEmitter, TypedEventEmitter } from "./typed-event-emitter";
import { EventMap } from "./event-map";
import { HeartbeatEvent } from "./heartbeat-event";

declare module "fastify" {
  interface FastifyInstance {
    eventEmitter: DomainEventEmitter;
  }
}

export const EVENT_EMITTER_PLUGIN = "event-emitter";

export const eventEmitterPlugin = fastifyPlugin(
  (app) => {
    app.addSchema(HeartbeatEvent);
    app.decorate("eventEmitter", new TypedEventEmitter<EventMap>());
  },
  {
    name: EVENT_EMITTER_PLUGIN,
  }
);
