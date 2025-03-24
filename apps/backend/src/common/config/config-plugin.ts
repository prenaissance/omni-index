import crypto from "node:crypto";
import { fastifyPlugin } from "fastify-plugin";
import { z } from "zod";
import { ConfigStorage } from "./config-storage";
import { ENV_PLUGIN } from "./env-plugin";
import { MONGODB_PLUGIN } from "~/common/mongodb/plugins/mongodb-plugin";

const configSchema = z.object({
  SESSION_SECRET: z
    .string()
    .min(32, "The secret key must be at least 32 characters long"),
});

export type ConfigSchema = z.infer<typeof configSchema>;

declare module "fastify" {
  interface FastifyInstance {
    readonly config: {
      readonly storage: ConfigStorage;
      readonly schema: ConfigSchema;
    };
  }
}

export const CONFIG_PLUGIN = "config";

export const configPlugin = fastifyPlugin(
  async (app) => {
    const configStorage = new ConfigStorage(app.db);
    // generally, this is not the best idea. Done to avoid an extra component in the system (secret vault)
    let sessionSecret = await configStorage.get<string>("SESSION_SECRET");
    if (!sessionSecret) {
      sessionSecret =
        app.env.INIT_SESSION_SECRET || crypto.randomBytes(32).toString("hex");
      await configStorage.set("SESSION_SECRET", sessionSecret);
    }

    app.decorate("config", {
      storage: configStorage,
      schema: configSchema.parse({ SESSION_SECRET: sessionSecret }),
    });
  },
  {
    name: CONFIG_PLUGIN,
    dependencies: [MONGODB_PLUGIN, ENV_PLUGIN],
  }
);
