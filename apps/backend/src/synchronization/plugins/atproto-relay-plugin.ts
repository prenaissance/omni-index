import { IdResolver } from "@atproto/identity";
import { Firehose, Event as AtprotoEvent } from "@atproto/sync";
import { fastifyPlugin } from "fastify-plugin";
import { Observable, Subject } from "rxjs";

export const ATPROTO_RELAY_PLUGIN = "atproto-relay";

declare module "fastify" {
  interface FastifyInstance {
    readonly relay: {
      readonly firehose: Firehose;
      readonly stream$: Observable<AtprotoEvent>;
    };
  }
}

export const atprotoRelayPlugin = fastifyPlugin(
  async (app) => {
    const subject = new Subject<AtprotoEvent>();
    const firehose = new Firehose({
      idResolver: new IdResolver(),
      filterCollections: [
        "app.bsky.actor.profile",
        "com.omni-index.comment",
        "com.omni-index.comment.like",
      ],
      onError: (error) => {
        app.log.debug({
          msg: "Firehose error",
          error: error.message,
        });
      },
      handleEvent: (event) => {
        if (["create", "update", "delete", "identity"].includes(event.event)) {
          subject.next(event);
        }
      },
      excludeAccount: true,
      excludeSync: true,
    });

    app.decorate("relay", {
      firehose,
      stream$: subject,
    });

    app.addHook("onReady", () => {
      firehose.start();
    });

    app.addHook("onClose", async () => {
      firehose.destroy();
      subject.complete();
    });
  },
  {
    name: ATPROTO_RELAY_PLUGIN,
    dependencies: [],
  }
);
