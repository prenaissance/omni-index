import { Type, Static } from "@sinclair/typebox";
import { GossipEvent } from "~/stored-events/entities/gossip-event";
import { ObjectIdSchema } from "~/common/payloads";
import { EntrySchema } from "~/media/payloads/entry/entry-schema";
import { CreateMediaRequest } from "~/media/payloads/media/create-media-request";

export const EntryCreatedEvent = Type.Object(
  {
    id: ObjectIdSchema(),
    type: Type.Literal("entry.created"),
    payload: Type.Object({
      entry: Type.Intersect([
        Type.Omit(EntrySchema, ["slug", "media"]),
        Type.Object({
          media: Type.Array(Type.Ref(CreateMediaRequest)),
        }),
      ]),
    }),
  },
  {
    $id: "EntryCreatedEvent",
  }
) satisfies {
  static: GossipEvent<"entry.created">;
};

export type EntryCreatedEvent = Static<typeof EntryCreatedEvent>;
