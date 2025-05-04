import { promisify } from "node:util";
import { FastifyInstance } from "fastify";
import { ObjectId } from "mongodb";
import { createIntegrationEntry } from "../media/entry-mocks";
import { build } from "~/app";
import {
  StoredEvent,
  StoredEventStatus,
} from "~/stored-events/entities/stored-event";
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

  describe("Pagination and filtering", () => {
    beforeAll(async () => {
      await app.storedEvents.repository.save(
        new StoredEvent({
          _id: ObjectId.createFromTime(1),
          type: "entry.created",
          createdAt: new Date("2023-01-02T00:00:00Z"),
          payload: {},
          status: StoredEventStatus.Accepted,
        })
      );
      await app.storedEvents.repository.save(
        new StoredEvent({
          _id: ObjectId.createFromTime(2),
          type: "entry.created",
          createdAt: new Date("2023-01-01T00:00:00Z"),
          payload: {},
          status: StoredEventStatus.Pending,
        })
      );
      await app.storedEvents.repository.save(
        new StoredEvent({
          _id: ObjectId.createFromTime(3),
          type: "entry.created",
          createdAt: new Date("2023-01-03T00:00:00Z"),
          payload: {},
          status: StoredEventStatus.Rejected,
        })
      );
    });
    afterAll(async () => {
      await app.storedEvents.repository.deleteMany({});
    });

    it("should paginate stored events sorted by date", async () => {
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
      const secondPage =
        secondPageResponse.json<PaginatedStoredEventsResponse>();
      expect(secondPage.total).toBe(3);
      expect(secondPage.events).toEqual([
        expect.objectContaining({
          _id: ObjectId.createFromTime(2).toString(),
        }),
      ]);
    });

    it.each([
      [StoredEventStatus.Accepted, ObjectId.createFromTime(1)],
      [StoredEventStatus.Pending, ObjectId.createFromTime(2)],
      [StoredEventStatus.Rejected, ObjectId.createFromTime(3)],
    ])("should filter stored events by status %s", async (status, id) => {
      const response = await app.inject({
        method: "GET",
        url: "/api/events",
        query: {
          page: "1",
          limit: "10",
          statuses: status,
        },
      });
      expect(response.statusCode).toBe(200);
      const eventsResponse = response.json<PaginatedStoredEventsResponse>();
      expect(eventsResponse.total).toBe(1);
      expect(eventsResponse.events).toEqual([
        expect.objectContaining({
          _id: id.toString(),
        }),
      ]);
    });

    it("should filter stored events by multiple statuses", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/events",
        query: {
          page: "1",
          limit: "10",
          statuses: [StoredEventStatus.Accepted, StoredEventStatus.Rejected],
        },
      });
      expect(response.statusCode).toBe(200);
      const eventsResponse = response.json<PaginatedStoredEventsResponse>();
      expect(eventsResponse.total).toBe(2);
      expect(eventsResponse.events).toEqual([
        expect.objectContaining({
          _id: ObjectId.createFromTime(3).toString(),
        }),
        expect.objectContaining({
          _id: ObjectId.createFromTime(1).toString(),
        }),
      ]);
    });
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
