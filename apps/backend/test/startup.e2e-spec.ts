import crypto from "node:crypto";
import { fail } from "node:assert";
import { FastifyInstance } from "fastify";
import { MongoClient } from "mongodb";
import { faker } from "@faker-js/faker";
import { build } from "~/app";
import { User } from "~/common/auth/entities/user";
import { UserRole } from "~/common/auth/entities/enums/user-role";

// Expensive test suite. Every run clears the DB and re-creates the app.
describe("Startup", () => {
  let app: FastifyInstance | null = null;

  afterEach(async () => {
    await app?.db?.dropDatabase();
    await app?.close();
    app = null;
  });

  describe("Session secret", () => {
    afterEach(() => {
      delete process.env.INIT_SESSION_SECRET;
    });

    it("should generate a session secret if not provided", async () => {
      app = await build();
      const sessionSecret = app.config.schema.SESSION_SECRET;
      expect(sessionSecret).toBeDefined();
      expect(sessionSecret).toHaveLength(64);
    });

    it("should use the provided session secret", async () => {
      const secretHex = crypto.randomBytes(32).toString("hex");
      process.env.INIT_SESSION_SECRET = secretHex;
      app = await build();

      expect(app.config.schema.SESSION_SECRET).toEqual(secretHex);
    });

    it("should not pass validation if the provided secret is less than 32 hex characters long", async () => {
      const secretHex = crypto.randomBytes(16).toString("hex");
      process.env.INIT_SESSION_SECRET = secretHex;

      try {
        app = await build();
        fail();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("Admin identity", () => {
    afterEach(() => {
      delete process.env.INIT_ADMIN_IDENTITY;
    });

    describe("Existing user", () => {
      let dbClient: MongoClient;

      beforeAll(async () => {
        dbClient = new MongoClient(process.env.MONGODB_URL!);
        await dbClient.connect();
      });

      afterAll(async () => {
        await dbClient.close();
      });

      it("should promote an existing user to admin based on their did", async () => {
        const did = `did:plc:${faker.string.alphanumeric(24)}` as const;
        process.env.INIT_ADMIN_IDENTITY = did;
        app = await build();
        await app.users.repository.save(
          new User({
            did,
            handle: "prenaissance.github.io",
            role: UserRole.User,
            displayName: faker.person.fullName(),
          })
        );
        await app.close();
        app = await build();
        await app.ready();

        const user = await app.users.repository.getByDid(did);
        expect(user).toBeDefined();
        expect(user!.role).toEqual(UserRole.Admin);
      });

      it("should promote an existing user to admin based on their handle", async () => {
        const did = `did:plc:${faker.string.alphanumeric(24)}` as const;
        const handle = "pnpm.io";
        process.env.INIT_ADMIN_IDENTITY = handle;

        app = await build();
        await app.users.repository.save(
          new User({
            did,
            handle,
            role: UserRole.User,
            displayName: faker.person.fullName(),
          })
        );
        await app.close();
        app = await build();
        await app.ready();

        const user = await app.users.repository.getByDid(did);
        expect(user).toBeDefined();
        expect(user!.role).toEqual(UserRole.Admin);
      });
    });
  });
});
