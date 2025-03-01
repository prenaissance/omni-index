import { faker } from "@faker-js/faker";
import { FastifyInstance } from "fastify";
import { CreateEntryRequest } from "~/media/payloads/entry/create-entry-request";
import { EntrySchema } from "~/media/payloads/entry/entry-schema";

export const getMockEntry = (overrides?: Partial<CreateEntryRequest>) =>
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

export const createIntegrationEntry = async (
  app: FastifyInstance,
  overrides?: Partial<CreateEntryRequest>
) => {
  const response = await app.inject({
    method: "POST",
    url: "/api/entries",
    payload: getMockEntry(overrides),
  });

  expect(response.statusCode).toBe(201);
  return response.json<EntrySchema>();
};
