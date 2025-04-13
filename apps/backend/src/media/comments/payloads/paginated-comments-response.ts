import { Static, Type } from "@sinclair/typebox";
import { CommentResponse } from "./comment-response";

export const PaginatedCommentsResponse = Type.Object(
  {
    comments: Type.Array(Type.Ref(CommentResponse)),
    total: Type.Number(),
  },
  {
    $id: "PaginatedCommentsResponse",
  }
);

export type PaginatedCommentsResponse = Static<
  typeof PaginatedCommentsResponse
>;
