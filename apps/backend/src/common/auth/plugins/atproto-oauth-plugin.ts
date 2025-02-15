import { Agent } from "@atproto/api";
import {
  NodeOAuthClient,
  NodeSavedSessionStore,
  NodeSavedStateStore,
} from "@atproto/oauth-client-node";
import { fastifyPlugin } from "fastify-plugin";
import { MongoSessionStore, MongoStateStore } from "../storage";
import { createOAuthClient } from "~/common/auth/oauth-client";
import { MONGODB_PLUGIN } from "~/common/mongodb/plugins/mongodb-plugin";

declare module "fastify" {
  interface FastifyInstance {
    readonly oauth: {
      readonly client: NodeOAuthClient;
      readonly stateStore: NodeSavedStateStore;
      readonly sessionStore: NodeSavedSessionStore;
    };
  }

  interface FastifyRequest {
    /**
     * The agent will be anonymous if the user is not authenticated.
     * Either check if the user is authenticated using `app.verifyAuthenticated` or
     * by checking the property `request.atproto.did`.
     */
    readonly atproto: Agent;
  }
}

export const atprotoOAuthPlugin = fastifyPlugin(
  async (app) => {
    const stateStore = new MongoStateStore(app.db);
    const sessionStore = new MongoSessionStore(app.db);
    app.decorate("oauth", {
      stateStore,
      sessionStore,
      client: await createOAuthClient(sessionStore, stateStore),
    });
    app.get(
      "/client-metadata.json",
      {
        schema: {
          tags: ["Atproto"],
        },
      },
      () => {
        return app.oauth.client.clientMetadata;
      }
    );
    app.decorateRequest("atproto", null!);

    app.addHook("onRequest", async (request) => {
      const did = request.session.get("did");

      const agent = did
        ? new Agent(await app.oauth.client.restore(did))
        : new Agent("https://bsky.social/xrpc");

      (request as { atproto: Agent }).atproto = agent;
    });
  },
  {
    name: "atproto-oauth",
    dependencies: [MONGODB_PLUGIN],
  }
);
