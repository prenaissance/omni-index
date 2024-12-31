import { Static, Type } from "@sinclair/typebox";
import { EntrySchema } from "./entry-schema";
import { CreateMediaRequest } from "./create-media-request";

export const CreateEntryRequest = Type.Intersect(
  [
    Type.Omit(EntrySchema, ["_id", "createdAt", "updatedAt", "slug", "media"]),
    Type.Object({
      media: Type.Array(CreateMediaRequest),
    }),
  ],
  {
    $id: "CreateEntryRequest",
  }
);

export type CreateEntryRequest = Static<typeof CreateEntryRequest>;
