import { FastifyPluginAsync } from "fastify";
import { MongoClient } from "mongodb";
import { env } from "~/env";

declare module "fastify" {
  interface FastifyInstance {
    mongo: MongoClient;
  }
}

const mongodbPlugin: FastifyPluginAsync = async (app) => {
  const client = new MongoClient(env.MONGODB_URL, {});

  app.addHook("onClose", async () => {
    await client.close();
  });
  await client.connect();
  app.decorate("mongo", client);
};

export default mongodbPlugin;
