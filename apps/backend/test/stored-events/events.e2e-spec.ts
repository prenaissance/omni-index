import { promisify } from "node:util";
import { FastifyInstance } from "fastify";
import { ObjectId } from "mongodb";
import { createIntegrationEntry } from "../media/entry-mocks";
import { build } from "~/app";
import { StoredEvent } from "~/stored-events/entities/stored-event";
import { PaginatedStoredEventsResponse } from "~/stored-events/payloads/paginated-stored-events-response";

const sleep = promisify(setTimeout);

describe("Stored Events", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await build();
  });
  afterAll(async () => {
    await app.close();
  });

  it("should paginate stored events sorted by date", async () => {
    await app.storedEvents.repository.add(
      new StoredEvent({
        _id: ObjectId.createFromTime(1),
        type: "entry.created",
        createdAt: new Date("2023-01-02T00:00:00Z"),
        payload: {},
      })
    );
    await app.storedEvents.repository.add(
      new StoredEvent({
        _id: ObjectId.createFromTime(2),
        type: "entry.created",
        createdAt: new Date("2023-01-01T00:00:00Z"),
        payload: {},
      })
    );
    await app.storedEvents.repository.add(
      new StoredEvent({
        _id: ObjectId.createFromTime(3),
        type: "entry.created",
        createdAt: new Date("2023-01-03T00:00:00Z"),
        payload: {},
      })
    );

    const firstPageResponse = await app.inject({
      method: "GET",
      url: "/api/events",
      query: {
        page: "1",
        limit: "2",
      },
    });

    expect(firstPageResponse.statusCode).toBe(200);
    const firstPage = firstPageResponse.json<PaginatedStoredEventsResponse>();
    expect(firstPage.total).toBe(3);
    expect(firstPage.events).toEqual([
      expect.objectContaining({
        _id: ObjectId.createFromTime(3).toString(),
      }),
      expect.objectContaining({
        _id: ObjectId.createFromTime(1).toString(),
      }),
    ]);

    const secondPageResponse = await app.inject({
      method: "GET",
      url: "/api/events",
      query: {
        page: "2",
        limit: "2",
      },
    });
    expect(secondPageResponse.statusCode).toBe(200);
    const secondPage = secondPageResponse.json<PaginatedStoredEventsResponse>();
    expect(secondPage.total).toBe(3);
    expect(secondPage.events).toEqual([
      expect.objectContaining({
        _id: ObjectId.createFromTime(2).toString(),
      }),
    ]);
  });

  it.todo("should create a stored event on entry creation", async () => {
    const body = await createIntegrationEntry(app);
    await sleep(3000);
    const entryId = body._id;
    const eventsResponse = await app.inject({
      method: "GET",
      url: `/api/events`,
      query: {
        page: "1",
        limit: "10",
      },
    });
    expect(eventsResponse.statusCode).toBe(200);
    const events = eventsResponse.json<PaginatedStoredEventsResponse>();
    expect(events.events).toContainEqual(
      expect.objectContaining({
        payload: expect.objectContaining({
          _id: entryId,
        }),
      })
    );
  });
});
