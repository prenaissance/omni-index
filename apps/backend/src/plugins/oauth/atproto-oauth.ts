import { Agent } from "@atproto/api";
import { NodeOAuthClient } from "@atproto/oauth-client-node";
import { FastifyPluginAsync } from "fastify";
import { fastifyPlugin } from "fastify-plugin";
import { createOAuthClient } from "~/common/auth/oauth-client";

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

const atprotoOAuthPlugin: FastifyPluginAsync = async (app) => {
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
};

export default fastifyPlugin(atprotoOAuthPlugin, {
  name: "atproto-oauth",
  dependencies: ["mongodb"],
});
