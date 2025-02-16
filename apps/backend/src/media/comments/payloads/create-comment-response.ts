import { Type } from "@sinclair/typebox";
import { DateSchema } from "~/common/payloads";

export const CreateCommentResponse = Type.Object(
  {
    entrySlug: Type.String(),
    tid: Type.String(),
    text: Type.String(),
    createdAt: DateSchema(),
  },
  {
    $id: "CreateCommentResponse",
  }
);
