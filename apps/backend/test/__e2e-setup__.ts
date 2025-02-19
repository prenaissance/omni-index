import {
  MongoDBContainer,
  StartedMongoDBContainer,
} from "@testcontainers/mongodb";
import { AtprotoDid } from "@atproto/oauth-client-node";
import { Agent } from "@atproto/api";
import { faker } from "@faker-js/faker";
import { createMock } from "@golevelup/ts-vitest";
import { GenericContainer, Wait } from "testcontainers";

export const mockDid: AtprotoDid = `did:plc:${faker.string.alphanumeric(24)}`;
export const mockAtprotoAgent = createMock<Agent>({
  assertDid: mockDid,
  did: mockDid,
});

vi.mock("@atproto/api", () => ({
  Agent: vi.fn().mockImplementation(() => mockAtprotoAgent),
}));

export const mongodbContainer = await new GenericContainer("mongo:8")
  .withExposedPorts(27017)
  .withWaitStrategy(Wait.forLogMessage(/Startup from clean shutdown\?/))
  .start();
process.env.MONGODB_URL = `mongodb://localhost:${mongodbContainer.getMappedPort(27017)}`;
process.env.MONGODB_DB = "test";

afterAll(async () => {
  await mongodbContainer.stop();
});
