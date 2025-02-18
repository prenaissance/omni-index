import { fastifyPlugin } from "fastify-plugin";
import { EntryRepository } from "./repositories/entry-repository";
import { mediaPayloadsPlugin } from "./payloads/_plugin";
import { CommentRepository } from "./comments/comment-repository";
import { CommentService } from "./comments/comment-service";
import { EVENT_EMITTER_PLUGIN } from "~/common/events/_plugin";
import { MONGODB_PLUGIN } from "~/common/mongodb/plugins/mongodb-plugin";

declare module "fastify" {
  interface FastifyInstance {
    readonly mediaEntry: {
      readonly repository: EntryRepository;
      readonly comments: {
        readonly repository: CommentRepository;
        readonly service: CommentService;
      };
    };
  }
}

export const MEDIA_PLUGIN = "media";

export const mediaPlugin = fastifyPlugin(
  (app) => {
    const commentRepository = new CommentRepository(app.db, app.eventEmitter);
    const commentService = new CommentService(
      commentRepository,
      app.eventEmitter
    );

    app.decorate("mediaEntry", {
      repository: new EntryRepository(app.db, app.eventEmitter),
      comments: {
        repository: commentRepository,
        service: commentService,
      },
    });
    app.register(mediaPayloadsPlugin);

    app.addHook("onClose", async () => {
      commentService[Symbol.dispose]();
    });
  },
  {
    name: MEDIA_PLUGIN,
    dependencies: [EVENT_EMITTER_PLUGIN, MONGODB_PLUGIN],
  }
);
