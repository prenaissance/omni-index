import { AtprotoDid } from "@atproto/oauth-client-node";
import { fastifySecureSession } from "@fastify/secure-session";
import { fastifyPlugin } from "fastify-plugin";
import { CONFIG_PLUGIN } from "~/common/config/config-plugin";

declare module "@fastify/secure-session" {
  interface SessionData {
    did: AtprotoDid;
  }
}

export const SECURE_SESSION_SETUP_PLUGIN = "secure-session-setup";

export const sessionSetupPlugin = fastifyPlugin(
  (app) => {
    app.register(fastifySecureSession, {
      key: Buffer.from(app.config.schema.SESSION_SECRET, "utf-8").subarray(
        0,
        32
      ),
      expiry: 60 * 60 * 24 * 7,
      cookie: {
        path: "/",
      },
    });
  },
  {
    name: SECURE_SESSION_SETUP_PLUGIN,
    dependencies: [CONFIG_PLUGIN],
  }
);
