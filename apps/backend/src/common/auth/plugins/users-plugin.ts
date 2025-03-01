import { fastifyPlugin } from "fastify-plugin";
import { UserRepository } from "../repositories/user-repository";
import { UserService } from "../user-service";
import { MONGODB_PLUGIN } from "~/common/mongodb/plugins/mongodb-plugin";

declare module "fastify" {
  interface FastifyInstance {
    readonly users: {
      readonly repository: UserRepository;
      readonly service: UserService;
    };
  }
}

export const USERS_PLUGIN = "users";

export const usersPlugin = fastifyPlugin(
  async (app) => {
    const repository = new UserRepository(app.db, app.oauth.sessionStore);
    const service = new UserService(repository);
    app.decorate("users", {
      repository,
      service,
    });
  },
  {
    name: USERS_PLUGIN,
    dependencies: [MONGODB_PLUGIN],
  }
);
