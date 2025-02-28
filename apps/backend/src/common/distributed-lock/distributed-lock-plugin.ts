import fastifyPlugin from "fastify-plugin";
import { DistributedLockService } from "./distributed-lock-service";
import { MONGODB_PLUGIN } from "../mongodb/plugins/mongodb-plugin";

declare module "fastify" {
  interface FastifyInstance {
    readonly distributedLock: DistributedLockService;
  }
}

export const DISTRIBUTED_LOCK_PLUGIN = "distributedLock";

export const distributedLockPlugin = fastifyPlugin(
  async (app) => {
    app.decorate("distributedLock", new DistributedLockService(app.db));
  },
  {
    name: DISTRIBUTED_LOCK_PLUGIN,
    dependencies: [MONGODB_PLUGIN],
  }
);
