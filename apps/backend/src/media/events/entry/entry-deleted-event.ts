import { Type, Static } from "@sinclair/typebox";
import { GossipEvent } from "~/stored-events/entities/gossip-event";
import { ObjectIdSchema } from "~/common/payloads";

export const EntryDeletedEvent = Type.Object(
  {
    id: ObjectIdSchema(),
    type: Type.Literal("entry.deleted"),
    payload: Type.Object({ entryId: ObjectIdSchema() }),
  },
  {
    $id: "EntryDeletedEvent",
  }
) satisfies {
  static: GossipEvent<"entry.deleted">;
};

export type EntryDeletedEvent = Static<typeof EntryDeletedEvent>;
