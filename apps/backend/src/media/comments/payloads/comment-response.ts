import { Static, Type } from "@sinclair/typebox";
import { DateSchema } from "~/common/payloads";

export const CommentResponse = Type.Object(
  {
    tid: Type.String(),
    text: Type.String(),
    createdAt: DateSchema(),
    createdBy: Type.Object({
      did: Type.String(),
      displayName: Type.Optional(Type.String()),
      avatarUrl: Type.Optional(Type.String({ format: "uri" })),
    }),
    likes: Type.Number(),
    liked: Type.Boolean(),
  },
  {
    $id: "CommentResponse",
  }
);

export type CommentResponse = Static<typeof CommentResponse>;
