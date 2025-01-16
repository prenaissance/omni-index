import crypto from "node:crypto";
import { fastifyPlugin } from "fastify-plugin";
import { z } from "zod";
import { ConfigStorage } from "./config-storage";
import { env } from "./env";
import { MONGODB_PLUGIN } from "~/common/mongodb/plugins/mongodb-plugin";

const configSchema = z.object({
  JWT_SECRET: z
    .string()
    .min(32, "The secret key must be at least 32 characters long"),
});

export type ConfigSchema = z.infer<typeof configSchema>;

declare module "fastify" {
  interface FastifyInstance {
    config: ConfigSchema;
  }
}

export const CONFIG_PLUGIN = "config";

export const configPlugin = fastifyPlugin(
  async (app) => {
    const configStorage = new ConfigStorage(app.db);
    // generally, this is not the best idea. Done to avoid an extra component in the system (secret vault)
    let jwtSecret = await configStorage.get<string>("JWT_SECRET");
    if (!jwtSecret) {
      jwtSecret = env.INIT_JWT_SECRET ?? crypto.randomBytes(32).toString("hex");
      await configStorage.set("JWT_SECRET", jwtSecret);
    }

    app.decorate("config", configSchema.parse({ JWT_SECRET: jwtSecret }));
  },
  {
    name: CONFIG_PLUGIN,
    dependencies: [MONGODB_PLUGIN],
  }
);
