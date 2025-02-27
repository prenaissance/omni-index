import { Static, Type } from "@sinclair/typebox";

export const CommentLikeResponse = Type.Object(
  {
    uri: Type.String({ format: "uri" }),
    tid: Type.String(),
  },
  {
    $id: "CommentLikeResponse",
  }
);

export type CommentLikeResponse = Static<typeof CommentLikeResponse>;
