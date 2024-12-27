import { FastifyPluginAsync } from "fastify";
import { fastifyPlugin } from "fastify-plugin";
import { Db, MongoClient } from "mongodb";
import { env } from "~/env";

declare module "fastify" {
  interface FastifyInstance {
    readonly mongo: MongoClient;
    readonly db: Db;
  }
}

const mongodbPlugin: FastifyPluginAsync = async (app) => {
  const client = new MongoClient(env.MONGODB_URL, {});

  app.addHook("onClose", async () => {
    await client.close();
  });
  await client.connect();
  app.decorate("mongo", client);
  app.decorate("db", client.db(process.env.MONGODB_DB));
};

export default fastifyPlugin(mongodbPlugin, {
  name: "mongodb",
});
