import { Static, Type } from "@sinclair/typebox";
import { StoredEvent } from "../entities/stored-event";
import { ClassProperties } from "~/common/utilities/serialization";
import { ObjectIdSchema } from "~/common/payloads/object-id-schema";
import { DateSchema } from "~/common/payloads/date-schema";

export const StoredEventResponse = Type.Object(
  {
    _id: ObjectIdSchema(),
    createdAt: DateSchema(),
    type: Type.String({
      description: "TODO: Constraint to possible events enum",
    }),
    payload: Type.Any(),
    nodeUrl: Type.Union([
      Type.String({
        format: "uri",
        description:
          "The URL of the node that propagated the event. Null if event was created locally.",
      }),
      Type.Null(),
    ]),
  },
  { $id: "StoredEventResponse" }
) satisfies { static: ClassProperties<StoredEvent> };

export type StoredEventResponse = Static<typeof StoredEventResponse>;
