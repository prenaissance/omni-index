import { faker } from "@faker-js/faker";
import { FastifyInstance } from "fastify";
import { build } from "~/app";
import { CreateEntryRequest } from "~/media/payloads/entry/create-entry-request";
import { EntrySchema } from "~/media/payloads/entry/entry-schema";
import { CreateIndexRequest } from "~/media/payloads/index/create-index-request";

const getMockEntry = (overrides?: Partial<CreateEntryRequest>) =>
  ({
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
    ...overrides,
  }) satisfies CreateEntryRequest;

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
      payload: getMockEntry() satisfies CreateEntryRequest,
    });

    expect(response.statusCode).toBe(201);
    const body = response.json<EntrySchema>();
    expect(body).toMatchObject({
      _id: expect.any(String),
      title: expect.any(String),
    });
    const entryId = body._id;

    const getResponse = await app.inject({
      method: "GET",
      url: `/api/entries/${entryId}`,
    });

    expect(getResponse.statusCode).toBe(200);
    const getBody = getResponse.json<EntrySchema>();
    expect(getBody).toMatchObject({
      _id: entryId,
      title: body.title,
    });
  });

  it("should add a mirror then retrieve it from the media entry", async () => {
    const entryResponse = await app.inject({
      method: "POST",
      url: "/api/entries",
      payload: getMockEntry() satisfies CreateEntryRequest,
    });
    expect(entryResponse.statusCode).toBe(201);
    const entryBody = entryResponse.json<EntrySchema>();
    const entryId = entryBody._id;
    const mediaId = entryBody.media[0]._id;

    const mirrorUrl = faker.internet.url();
    const mirrorResponse = await app.inject({
      method: "POST",
      url: `/api/entries/${entryId}/media/${mediaId}/mirrors`,
      payload: [
        {
          blob: {
            url: mirrorUrl,
          },
          meta: {},
        },
      ] satisfies CreateIndexRequest[],
    });

    expect(mirrorResponse.statusCode).toBe(201);
    const mirrorBody = mirrorResponse.json<EntrySchema>();
    expect(mirrorBody.media[0].mirrors).toContainEqual(
      expect.objectContaining({
        blob: {
          url: mirrorUrl,
        },
        meta: {},
      })
    );

    const getResponse = await app.inject({
      method: "GET",
      url: `/api/entries/${entryId}`,
    });

    expect(getResponse.statusCode).toBe(200);
    const getBody = getResponse.json<EntrySchema>();

    expect(getBody.media[0].mirrors).toContainEqual(
      expect.objectContaining({
        blob: {
          url: mirrorUrl,
        },
        meta: {},
      })
    );
  });
});
