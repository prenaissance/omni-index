import { Type } from "@sinclair/typebox";
import { DateSchema, ObjectIdSchema } from "~/common/payloads";

export const CommentResponse = Type.Object(
  {
    entryId: ObjectIdSchema(),
    tid: Type.String(),
    text: Type.String(),
    createdAt: DateSchema(),
  },
  {
    $id: "CommentResponse",
  }
);
