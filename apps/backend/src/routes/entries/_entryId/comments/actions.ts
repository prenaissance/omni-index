import {
  FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";
import { TID } from "@atproto/common";
import { ObjectId } from "mongodb";
import { AtprotoDid } from "@atproto/oauth-client-node";
import { ValidationError } from "@atproto/lexicon";
import { CommentEntity } from "~/media/comments/entities/comment";
import { CreateCommentRequest } from "~/media/comments/payloads/create-comment-request";
import { ExceptionSchema, ObjectIdSchema } from "~/common/payloads";
import { CreateCommentResponse } from "~/media/comments/payloads";
import { CommentResponse } from "~/media/comments/payloads/comment-response";
import { PaginationQuery } from "~/common/payloads/pagination";

const entryCommentRoutes: FastifyPluginAsyncTypebox = async (app) => {
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
          userDid: request.atproto.did as AtprotoDid | undefined,
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

      try {
        await app.mediaEntry.comments.service.createComment(
          comment,
          request.atproto,
          request.log
        );
        return reply.code(201).send(comment);
      } catch (error) {
        if (error instanceof ValidationError) {
          return reply.code(400).send({
            message: error.message,
          });
        }

        throw error;
      }
    }
  );
};

export default entryCommentRoutes;
