import { Static, Type } from "@sinclair/typebox";

export const PaginationQuery = Type.Object(
  {
    page: Type.Optional(
      Type.Integer({
        description: "Page number (1 indexed)",
        default: 1,
        minimum: 1,
        maximum: 100,
      })
    ),
    limit: Type.Optional(
      Type.Integer({ description: "Page size", default: 10, minimum: 10 })
    ),
  },
  {
    $id: "PaginationQuery",
  }
);

export type PaginationQuery = Static<typeof PaginationQuery>;
