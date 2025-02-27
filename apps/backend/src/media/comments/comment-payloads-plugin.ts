import { fastifyPlugin } from "fastify-plugin";
import {
  CommentLikeResponse,
  CommentResponse,
  CreateCommentRequest,
  CreateCommentResponse,
} from "./payloads";

export const commentsPayloadsPlugin = fastifyPlugin((app) => {
  app.addSchema(CreateCommentRequest);
  app.addSchema(CreateCommentResponse);
  app.addSchema(CommentResponse);
  app.addSchema(CommentLikeResponse);
});
