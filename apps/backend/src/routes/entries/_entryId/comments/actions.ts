import {
  FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";
import { TID } from "@atproto/common";
import { ObjectId } from "mongodb";
import { AtprotoDid } from "@atproto/oauth-client-node";
import * as Comment from "~/atproto/types/com/omni-index/comment";
import { CommentEntity } from "~/media/comments/entities/comment";
import { CreateCommentRequest } from "~/media/comments/payloads/create-comment-request";
import { ExceptionSchema, ObjectIdSchema } from "~/common/payloads";
import { CreateCommentResponse } from "~/media/comments/payloads";
import { CommentResponse } from "~/media/comments/payloads/comment-response";
import { PaginationQuery } from "~/common/payloads/pagination";

const entryCommentRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.addSchema(CreateCommentRequest);
  app.addSchema(CreateCommentResponse);
  app.addSchema(CommentResponse);

  app.get(
    "",
    {
      schema: {
        tags: ["Entries", "Comments"],
        security: [],
        querystring: Type.Ref(PaginationQuery),
        params: Type.Object({
          entryId: ObjectIdSchema({
            description: "ObjectId of the media entry",
          }),
        }),
        response: {
          200: Type.Array(Type.Ref(CommentResponse)),
          404: Type.Ref(ExceptionSchema),
        },
      },
    },
    async (request, reply) => {
      const { page = 1, limit = 10 } = request.query;
      const skip = (page - 1) * limit;

      const entry = await app.mediaEntry.repository.findOne(
        new ObjectId(request.params.entryId)
      );

      if (!entry) {
        return reply.code(404).send({
          message: "Entry not found",
        });
      }

      const comments = await app.mediaEntry.comments.repository.findMany(
        {
          entrySlug: entry.slug,
        },
        {
          skip,
          limit,
          sort: {
            createdAt: "desc",
          },
        }
      );

      return comments;
    }
  );

  app.post(
    "",
    {
      onRequest: app.auth([app.verifyAuthenticated]),
      schema: {
        tags: ["Entries", "Comments"],
        params: Type.Object({
          entryId: ObjectIdSchema({
            description: "ObjectId of the media entry",
          }),
        }),
        body: Type.Ref(CreateCommentRequest),
        response: {
          201: Type.Ref(CreateCommentResponse),
          400: Type.Ref(ExceptionSchema),
        },
      },
    },
    async (request, reply) => {
      const entry = await app.mediaEntry.repository.findOne(
        new ObjectId(request.params.entryId)
      );
      if (!entry) {
        return reply.code(404).send({
          message: "Entry not found",
        });
      }

      const tid = TID.nextStr();

      const comment = new CommentEntity({
        tid,
        entrySlug: entry.slug,
        text: request.body.text,
        createdAt: new Date(),
        createdByDid: request.atproto.assertDid as AtprotoDid,
      });

      const record: Comment.Record = {
        entrySlug: entry.slug,
        text: comment.text,
        createdAt: comment.createdAt.toISOString(),
      };

      const validationResult = Comment.validateRecord(record);
      if (!validationResult.success) {
        return reply.code(400).send({
          message: validationResult.error.message,
        });
      }

      const {
        data: { uri },
      } = await request.atproto.com.atproto.repo.putRecord({
        repo: request.atproto.assertDid,
        collection: "com.omni-index.comment",
        record,
        rkey: tid,
        validate: false,
      });
      request.log.debug({
        msg: "Comment record created",
        entrySlug: entry.slug,
        uri,
      });

      await app.mediaEntry.comments.repository.save(comment);

      return reply.code(201).send(comment);
    }
  );
};

export default entryCommentRoutes;
