import { fastifyPlugin } from "fastify-plugin";
import { EntryRepository } from "./repositories/entry-repository";
import { mediaPayloadsPlugin } from "./payloads/_plugin";
import { CommentRepository } from "./comments/comment-repository";
import { CommentService } from "./comments/comment-service";
import { EntryExportService } from "./exports/entry-export-service";
import { EntryService } from "./entry-service";
import { EVENT_EMITTER_PLUGIN } from "~/common/events/_plugin";
import { MONGODB_PLUGIN } from "~/common/mongodb/plugins/mongodb-plugin";

declare module "fastify" {
  interface FastifyInstance {
    readonly mediaEntry: {
      readonly repository: EntryRepository;
      readonly service: EntryService;
      readonly comments: {
        readonly repository: CommentRepository;
        readonly service: CommentService;
      };
      readonly exports: {
        readonly service: EntryExportService;
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
      app.users.service,
      app.users.repository,
      app.eventEmitter,
      app.relay.stream$,
      app.log
    );

    const entryRepository = new EntryRepository(app.db);
    const entryService = new EntryService(
      entryRepository,
      app.eventEmitter,
      app.log
    );

    app.decorate("mediaEntry", {
      repository: entryRepository,
      service: entryService,
      comments: {
        repository: commentRepository,
        service: commentService,
      },
      exports: {
        service: new EntryExportService(app.db),
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
