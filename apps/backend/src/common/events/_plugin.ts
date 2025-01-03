import { fastifyPlugin } from "fastify-plugin";
import { DomainEventEmitter, TypedEventEmitter } from "./typed-event-emitter";
import { EventMap } from "./event-map";

declare module "fastify" {
  interface FastifyInstance {
    eventEmitter: DomainEventEmitter;
  }
}

export const EVENT_EMITTER_PLUGIN = "event-emitter";

export const eventEmitterPlugin = fastifyPlugin(
  (app) => {
    app.decorate("eventEmitter", new TypedEventEmitter<EventMap>());
  },
  {
    name: EVENT_EMITTER_PLUGIN,
  }
);
