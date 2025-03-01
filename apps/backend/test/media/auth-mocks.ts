import { faker } from "@faker-js/faker";
import { FastifyInstance } from "fastify";
import { UserRole } from "~/common/auth/entities/enums/user-role";
import { User } from "~/common/auth/entities/user";

export const createIntegrationUser = async (
  app: FastifyInstance,
  overrides?: Partial<User>
) => {
  const user = new User({
    did: `did:plc:${faker.string.alphanumeric(24)}`,
    role: UserRole.User,
    ...overrides,
  });
  app.users.repository.save(user);
  return user;
};
