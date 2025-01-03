import { Type, TSchema, ObjectOptions } from "@sinclair/typebox";

export const PaginatedResponse = <Schema extends TSchema>(
  schema: Schema,
  options?: ObjectOptions
) =>
  Type.Object(
    {
      data: Type.Array(schema),
      meta: Type.Object({
        total: Type.Integer({
          description: "Total number of items matching the query",
        }),
        page: Type.Integer({
          description: "Current page number (1 indexed)",
        }),
        limit: Type.Integer({
          description: "Number of items per page",
        }),
      }),
    },
    options
  );
