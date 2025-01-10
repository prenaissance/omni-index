import { Type } from "@sinclair/typebox";
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
  },
  { $id: "StoredEventResponse" }
) satisfies { static: ClassProperties<StoredEvent> };
