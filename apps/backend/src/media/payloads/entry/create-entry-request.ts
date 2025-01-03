import { Static, Type } from "@sinclair/typebox";
import { CreateMediaRequest } from "../media/create-media-request";
import { EntrySchema } from "./entry-schema";

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
