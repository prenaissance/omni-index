import { fastifyPlugin } from "fastify-plugin";
import { StoredEventRepository } from "./stored-event-repository";
import { MONGODB_PLUGIN } from "~/common/mongodb/plugins/mongodb-plugin";

declare module "fastify" {
  interface FastifyInstance {
    readonly storedEvents: {
      readonly repository: StoredEventRepository;
    };
  }
}

export const STORED_EVENT_PLUGIN = "stored-event-plugin";

export const storedEventPlugin = fastifyPlugin(
  async (app) => {
    app.decorate("storedEvents", {
      repository: new StoredEventRepository(app.db),
    });
  },
  {
    name: STORED_EVENT_PLUGIN,
    dependencies: [MONGODB_PLUGIN],
  }
);
