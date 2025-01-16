import { fastifyJwt } from "@fastify/jwt";
import { fastifyPlugin } from "fastify-plugin";
import { CONFIG_PLUGIN } from "~/common/config/config-plugin";

export const JWT_SETUP_PLUGIN = "jwt-setup";

export const jwtSetupPlugin = fastifyPlugin(
  (app) => {
    app.register(fastifyJwt, {
      secret: app.config.JWT_SECRET,
    });
  },
  {
    name: JWT_SETUP_PLUGIN,
    dependencies: [CONFIG_PLUGIN],
  }
);
