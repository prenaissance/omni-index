import crypto from "node:crypto";
import { fail } from "node:assert";
import { FastifyInstance } from "fastify";
import { build } from "~/app";

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
      const sessionSecret = app.config.SESSION_SECRET;
      expect(sessionSecret).toBeDefined();
      expect(sessionSecret).toHaveLength(64);
    });

    it("should use the provided session secret", async () => {
      const secretHex = crypto.randomBytes(32).toString("hex");
      process.env.INIT_SESSION_SECRET = secretHex;
      app = await build();

      expect(app.config.SESSION_SECRET).toEqual(secretHex);
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

  describe.todo("Admin identity");
});
