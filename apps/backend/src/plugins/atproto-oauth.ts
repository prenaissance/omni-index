import { NodeOAuthClient, OAuthServerAgent } from "@atproto/oauth-client-node";
import { fastifyPlugin } from "fastify-plugin";
import { createOAuthClient } from "~/auth/oauth-client";

declare module "fastify" {
  interface FastifyInstance {
    oauth: NodeOAuthClient;
  }

  interface FastifyRequest {
    // WIP
    // atproto: OAuthServerAgent;
  }
}

const atprotoOAuthPlugin = fastifyPlugin(async (app) => {
  app.decorate("oauth", await createOAuthClient(app.mongo.db()));
});

export default atprotoOAuthPlugin;
