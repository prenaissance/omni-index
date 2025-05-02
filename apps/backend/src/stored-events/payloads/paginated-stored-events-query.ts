import { Static, Type } from "@sinclair/typebox";
import { StoredEventStatus } from "../entities/stored-event";
import { PaginationQuery } from "~/common/payloads/pagination";

export const PaginatedStoredEventsQuery = Type.Intersect(
  [
    Type.Object({
      statuses: Type.Optional(
        Type.Union([
          Type.Enum(StoredEventStatus),
          Type.Array(Type.Enum(StoredEventStatus)),
        ])
      ),
    }),
    PaginationQuery,
  ],
  {
    $id: "PaginatedStoredEventsQuery",
    description: "Paginated stored events query",
  }
);

export type PaginatedStoredEventsQuery = Static<
  typeof PaginatedStoredEventsQuery
>;
