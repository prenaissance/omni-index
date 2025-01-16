import { fastifyPlugin } from "fastify-plugin";
import { UserRepository } from "../repositories/user-repository";
import { TokenRepository } from "../repositories/token-repository";
import { MONGODB_PLUGIN } from "~/common/mongodb/plugins/mongodb-plugin";

declare module "fastify" {
  interface FastifyInstance {
    readonly users: {
      readonly repository: UserRepository;
      readonly tokenRepository: TokenRepository;
    };
  }
}

export const USERS_PLUGIN = "users";

export const usersPlugin = fastifyPlugin(
  async (app) => {
    app.decorate("users", {
      repository: new UserRepository(app.db, app.oauth.sessionStore),
      tokenRepository: new TokenRepository(app.db),
    });
  },
  {
    name: USERS_PLUGIN,
    dependencies: [MONGODB_PLUGIN],
  }
);
