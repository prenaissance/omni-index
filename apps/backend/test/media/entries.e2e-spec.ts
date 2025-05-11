import { faker } from "@faker-js/faker";
import { FastifyInstance } from "fastify";
import { createIntegrationEntry } from "./entry-mocks";
import { build } from "~/app";
import { EntrySchema } from "~/media/payloads/entry/entry-schema";
import { CreateIndexRequest } from "~/media/payloads/index/create-index-request";

describe("Media Entries", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await build();
  });
  afterAll(async () => {
    await app.close();
  });

  it("should upload and then retrieve a media entry", async () => {
    const body = await createIntegrationEntry(app);
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
    const entryBody = await createIntegrationEntry(app);
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

  it("should update an entry and then retrieve it", async () => {
    const entryBody = await createIntegrationEntry(app);
    const entryId = entryBody._id;

    const updatedTitle = faker.lorem.sentence();
    const updateResponse = await app.inject({
      method: "PATCH",
      url: `/api/entries/${entryId}`,
      payload: {
        title: updatedTitle,
      },
    });
    expect(updateResponse.statusCode).toBe(200);
    const updateBody = updateResponse.json<EntrySchema>();
    expect(updateBody).toMatchObject({
      _id: entryId,
      title: updatedTitle,
    });
    const getResponse = await app.inject({
      method: "GET",
      url: `/api/entries/${entryId}`,
    });
    expect(getResponse.statusCode).toBe(200);
    const getBody = getResponse.json<EntrySchema>();
    expect(getBody).toMatchObject({
      _id: entryId,
      title: updatedTitle,
    });
  });
});
