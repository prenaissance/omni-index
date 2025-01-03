import { Agent } from "@atproto/api";
import { NodeOAuthClient } from "@atproto/oauth-client-node";
import { fastifyPlugin } from "fastify-plugin";
import { createOAuthClient } from "~/common/auth/oauth-client";
import { MONGODB_PLUGIN } from "~/common/mongodb/plugins/mongodb-plugin";

declare module "fastify" {
  interface FastifyInstance {
    readonly oauth: NodeOAuthClient;
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
    app.decorate("oauth", await createOAuthClient(app.mongo.db()));
    app.get("/client-metadata.json", () => {
      return app.oauth.clientMetadata;
    });

    app.addHook("onRequest", async (request) => {
      const sessionDid = request.session.get("did");

      const agent = sessionDid
        ? new Agent(await app.oauth.restore(sessionDid))
        : new Agent("https://bsky.social/xrpc");

      (request.atproto as Agent) = agent;
    });
  },
  {
    name: "atproto-oauth",
    dependencies: [MONGODB_PLUGIN],
  }
);
