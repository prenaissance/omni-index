import { Type, Static } from "@sinclair/typebox";
import { EntrySchema } from "~/media/payloads/entry/entry-schema";
import { CreateMediaRequest } from "~/media/payloads/media/create-media-request";

export const EntryCreatedEvent = Type.Object(
  {
    type: Type.Literal("entry.created"),
    entry: Type.Intersect([
      Type.Omit(EntrySchema, ["slug", "media"]),
      Type.Object({
        media: Type.Array(Type.Ref(CreateMediaRequest)),
      }),
    ]),
  },
  {
    $id: "EntryCreatedEvent",
  }
);

export type EntryCreatedEvent = Static<typeof EntryCreatedEvent>;
