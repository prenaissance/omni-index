import { fastifyPlugin } from "fastify-plugin";
import {
  CommentLikeResponse,
  CommentResponse,
  CreateCommentRequest,
  CreateCommentResponse,
} from "./payloads";
import { PaginatedCommentsResponse } from "./payloads/paginated-comments-response";

export const commentsPayloadsPlugin = fastifyPlugin((app) => {
  app.addSchema(CreateCommentRequest);
  app.addSchema(CreateCommentResponse);
  app.addSchema(CommentResponse);
  app.addSchema(PaginatedCommentsResponse);
  app.addSchema(CommentLikeResponse);
});
