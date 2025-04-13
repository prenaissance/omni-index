import { Static, Type } from "@sinclair/typebox";
import { StoredEventResponse } from "./stored-event-response";

export const PaginatedStoredEventsResponse = Type.Object(
  {
    events: Type.Array(Type.Ref(StoredEventResponse)),
    total: Type.Number({
      description: "Total number of stored events",
    }),
  },
  {
    $id: "PaginatedStoredEventsResponse",
    description: "Paginated stored events response",
  }
);

export type PaginatedStoredEventsResponse = Static<
  typeof PaginatedStoredEventsResponse
>;
