import { fastifyPlugin } from "fastify-plugin";
import { StoredEventRepository } from "./stored-event-repository";
import { StoredEventService } from "./stored-event-service";
import { MONGODB_PLUGIN } from "~/common/mongodb/plugins/mongodb-plugin";
import { EVENT_EMITTER_PLUGIN } from "~/common/events/_plugin";

declare module "fastify" {
  interface FastifyInstance {
    readonly storedEvents: {
      readonly repository: StoredEventRepository;
      readonly service: StoredEventService;
    };
  }
}

export const STORED_EVENT_PLUGIN = "stored-event-plugin";

export const storedEventPlugin = fastifyPlugin(
  async (app) => {
    const storedEventRepository = new StoredEventRepository(app.db);
    const storedEventService = new StoredEventService(
      storedEventRepository,
      app.eventEmitter,
      app.log
    );
    app.decorate("storedEvents", {
      repository: storedEventRepository,
      service: storedEventService,
    });

    app.addHook("onReady", async () => {
      await app.storedEvents.service.init();
    });

    app.addHook("onClose", async () => {
      app.storedEvents.service[Symbol.dispose]();
    });
  },
  {
    name: STORED_EVENT_PLUGIN,
    dependencies: [MONGODB_PLUGIN, EVENT_EMITTER_PLUGIN],
  }
);
