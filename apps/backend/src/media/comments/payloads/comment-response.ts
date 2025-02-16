import { Type } from "@sinclair/typebox";
import { DateSchema } from "~/common/payloads";

export const CommentResponse = Type.Object(
  {
    tid: Type.String(),
    text: Type.String(),
    createdAt: DateSchema(),
    likes: Type.Number(),
  },
  {
    $id: "CommentResponse",
  }
);
