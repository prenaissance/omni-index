import { fastifyPlugin } from "fastify-plugin";
import { Db, MongoClient } from "mongodb";
import { env } from "~/env";

declare module "fastify" {
  interface FastifyInstance {
    readonly mongo: MongoClient;
    readonly db: Db;
  }
}

export const MONGODB_PLUGIN = "mongodb";

export const mongodbPlugin = fastifyPlugin(
  async (app) => {
    const client = new MongoClient(env.MONGODB_URL, {});

    app.addHook("onClose", async () => {
      await client.close();
    });
    await client.connect();
    app.decorate("mongo", client);
    app.decorate("db", client.db(env.MONGODB_DB));
  },
  {
    name: MONGODB_PLUGIN,
  }
);
