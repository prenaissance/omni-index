import { Type, Static } from "@sinclair/typebox";
import { ObjectIdSchema } from "~/common/payloads";

export const EntryDeletedEvent = Type.Object(
  {
    type: Type.Literal("entry.deleted"),
    entryId: ObjectIdSchema(),
  },
  {
    $id: "EntryDeletedEvent",
  }
);

export type EntryDeletedEvent = Static<typeof EntryDeletedEvent>;
