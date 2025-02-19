import { fastifyPlugin } from "fastify-plugin";
import { Env, envSchema } from "./env";

declare module "fastify" {
  interface FastifyInstance {
    env: Env;
  }
}

export const ENV_PLUGIN = "env";

export const envPlugin = fastifyPlugin(
  async (app) => {
    const env = envSchema.parse(process.env);

    app.decorate("env", env);
  },
  {
    name: ENV_PLUGIN,
  }
);
