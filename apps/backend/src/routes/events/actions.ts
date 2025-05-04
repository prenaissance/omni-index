import {
  FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";
import { Filter, ObjectId } from "mongodb";
import { UserRole } from "~/common/auth/entities/enums/user-role";
import { ObjectIdSchema } from "~/common/payloads";
import {
  StoredEvent,
  StoredEventStatus,
} from "~/stored-events/entities/stored-event";
import { ChangeStoredEventStatusRequest } from "~/stored-events/payloads/change-stored-event-status-request";
import { PaginatedStoredEventsQuery } from "~/stored-events/payloads/paginated-stored-events-query";
import { PaginatedStoredEventsResponse } from "~/stored-events/payloads/paginated-stored-events-response";
import { StoredEventResponse } from "~/stored-events/payloads/stored-event-response";

const eventRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.addSchema(StoredEventResponse);
  app.addSchema(PaginatedStoredEventsQuery);
  app.addSchema(PaginatedStoredEventsResponse);
  app.addSchema(ChangeStoredEventStatusRequest);

  app.get(
    "",
    {
      schema: {
        tags: ["Events"],
        querystring: Type.Ref(PaginatedStoredEventsQuery),
        response: { 200: Type.Ref(PaginatedStoredEventsResponse) },
      },
    },
    async (request) => {
      const { page = 1, limit = 10 } = request.query;
      const statuses =
        request.query.statuses === undefined
          ? undefined
          : Array.isArray(request.query.statuses)
            ? request.query.statuses
            : [request.query.statuses];
      const skip = (page - 1) * limit;
      const filter: Filter<StoredEvent> = {};
      if (statuses) {
        filter.status = {
          $in: statuses,
        };
      }
      const [storedEvents, total] = await Promise.all([
        app.storedEvents.repository.findMany(filter, {
          skip,
          limit,
          sort: { createdAt: -1 },
        }),
        app.storedEvents.repository.count(filter),
      ]);

      return {
        events: storedEvents,
        total,
      };
    }
  );

  app.patch(
    "/:eventId/status",
    {
      onRequest: app.auth([app.verifyRoles([UserRole.User, UserRole.Admin])]),
      schema: {
        params: Type.Object({
          eventId: ObjectIdSchema({
            description: "ObjectId of the stored event",
          }),
        }),
        body: Type.Ref(ChangeStoredEventStatusRequest),
      },
    },
    async (request, reply) => {
      const allowedTransitions: Record<StoredEventStatus, StoredEventStatus[]> =
        {
          [StoredEventStatus.Accepted]: [],
          [StoredEventStatus.Pending]: [
            StoredEventStatus.Accepted,
            StoredEventStatus.Rejected,
          ],
          [StoredEventStatus.Rejected]: [],
        };

      const { status } = request.body;
      const storedEvent = await app.storedEvents.repository.findOne({
        _id: new ObjectId(request.params.eventId),
      });
      if (!storedEvent) {
        return reply.code(404).send({
          message: "Stored event not found",
        });
      }
      if (!allowedTransitions[storedEvent.status].includes(status)) {
        return reply.code(400).send({
          message: `Invalid status transition from ${storedEvent.status} to ${status}`,
        });
      }
      if (status === StoredEventStatus.Accepted) {
        await app.peerNodes.service.applyEventChange(
          storedEvent.payload as never,
          storedEvent.nodeUrl! // Pending events always come from other nodes, safe assertion
        );
      }
      storedEvent.status = status;
      await app.storedEvents.repository.save(storedEvent);
      return reply.code(204).send();
    }
  );
};

export default eventRoutes;
