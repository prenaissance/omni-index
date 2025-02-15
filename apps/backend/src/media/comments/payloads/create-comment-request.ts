import { Static, Type } from "@sinclair/typebox";

export const CreateCommentRequest = Type.Object(
  {
    text: Type.String(),
  },
  {
    $id: "CreateCommentRequest",
  }
);

export type CreateCommentRequest = Static<typeof CreateCommentRequest>;
