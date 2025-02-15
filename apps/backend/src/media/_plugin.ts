import { fastifyPlugin } from "fastify-plugin";
import { EntryRepository } from "./repositories/entry-repository";
import { mediaPayloadsPlugin } from "./payloads/_plugin";
import { CommentRepository } from "./comments/comment-repository";
import { EVENT_EMITTER_PLUGIN } from "~/common/events/_plugin";
import { MONGODB_PLUGIN } from "~/common/mongodb/plugins/mongodb-plugin";

declare module "fastify" {
  interface FastifyInstance {
    readonly mediaEntry: {
      readonly repository: EntryRepository;
      readonly comments: {
        readonly repository: CommentRepository;
      };
    };
  }
}

export const MEDIA_PLUGIN = "media";

export const mediaPlugin = fastifyPlugin(
  (app) => {
    app.decorate("mediaEntry", {
      repository: new EntryRepository(app.db, app.eventEmitter),
      comments: {
        repository: new CommentRepository(app.db),
      },
    });
    app.register(mediaPayloadsPlugin);
  },
  {
    name: MEDIA_PLUGIN,
    dependencies: [EVENT_EMITTER_PLUGIN, MONGODB_PLUGIN],
  }
);
