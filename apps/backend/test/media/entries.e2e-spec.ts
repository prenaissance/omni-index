import { faker } from "@faker-js/faker";
import { FastifyInstance } from "fastify";
import { build } from "~/app";
import { CreateEntryRequest } from "~/media/payloads/entry/create-entry-request";
import { EntrySchema } from "~/media/payloads/entry/entry-schema";

describe("Media Entries", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await build();
  });
  afterAll(async () => {
    await app.close();
  });

  it("should upload and then retrieve a media entry", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/entries",
      payload: {
        meta: {},
        title: faker.lorem.word(),
        author: faker.person.fullName(),
        year: 2021,
        genres: [faker.lorem.word()],
        media: [
          {
            mirrors: [
              {
                blob: {
                  url: faker.internet.url(),
                },
                meta: {},
              },
            ],
            meta: {},
          },
        ],
      } satisfies CreateEntryRequest,
    });

    expect(response.statusCode).toBe(201);
    expect(response.json<EntrySchema>()).toMatchObject({
      title: expect.any(String),
    });
  });
});
