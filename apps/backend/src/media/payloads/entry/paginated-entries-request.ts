import { Type, Static } from "@sinclair/typebox";
import { PaginationQuery } from "~/common/payloads/pagination";

export const PaginatedEntriesRequest = Type.Intersect(
  [
    PaginationQuery,
    Type.Object({
      author: Type.Optional(
        Type.String({
          description: "Filter by author. Case insensitive.",
        })
      ),
      orderBy: Type.Optional(
        Type.Union([Type.Literal("createdAt"), Type.Literal("updatedAt")])
      ),
      search: Type.Optional(
        Type.String({
          description: "Search by title, author or description.",
        })
      ),
    }),
  ],
  {
    $id: "PaginatedEntriesRequest",
  }
);

export type PaginatedEntriesRequest = Static<typeof PaginatedEntriesRequest>;
