import { fastifyPlugin } from "fastify-plugin";
import { EntryRepository } from "./repositories/entry-repository";
import { EVENT_EMITTER_PLUGIN } from "~/common/events/_plugin";
import { MONGODB_PLUGIN } from "~/common/mongodb/plugins/mongodb-plugin";

declare module "fastify" {
  interface FastifyInstance {
    mediaEntry: {
      repository: EntryRepository;
    };
  }
}

export const MEDIA_PLUGIN = "media";

export const mediaPlugin = fastifyPlugin(
  (app) => {
    app.decorate("mediaEntry", {
      repository: new EntryRepository(app.db, app.eventEmitter),
    });
  },
  {
    name: MEDIA_PLUGIN,
    dependencies: [EVENT_EMITTER_PLUGIN, MONGODB_PLUGIN],
  }
);
