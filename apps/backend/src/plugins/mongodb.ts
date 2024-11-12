import { FastifyPluginAsync } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { MongoClient } from "mongodb";
import { env } from "~/env";

declare module "fastify" {
  interface FastifyInstance {
    readonly mongo: MongoClient;
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

export default fastifyPlugin(mongodbPlugin, {
  name: "mongodb",
});
