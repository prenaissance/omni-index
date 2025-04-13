import { AtprotoDid } from "@atproto/oauth-client-node";
import {
  FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";
import { ObjectId } from "mongodb";
import {
  AtprotoDeletionResponse,
  ExceptionSchema,
  ObjectIdSchema,
} from "~/common/payloads";
import { CommentLikeResponse } from "~/media/comments/payloads/comment-like-response";
import { CommentResponse } from "~/media/comments/payloads";

const entryCommentTidRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.get(
    "",
    {
      schema: {
        tags: ["Entries", "Comments"],
        params: Type.Object({
          entryId: ObjectIdSchema({
            description: "ObjectId of the media entry",
          }),
          tid: Type.String({
            description: "Comment tid",
          }),
        }),
        response: {
          200: Type.Ref(CommentResponse),
          404: Type.Ref(ExceptionSchema),
        },
      },
    },
    async (request, reply) => {
      const { entryId, tid } = request.params;
      const entry = await app.mediaEntry.repository.findOne(
        new ObjectId(entryId)
      );
      if (!entry) {
        return reply.code(404).send({
          message: "Entry not found",
        });
      }

      const comment = await app.mediaEntry.comments.repository.findOne(
        {
          entrySlug: entry.slug,
          tid,
        },
        request.atproto.did as AtprotoDid | undefined
      );
      if (!comment) {
        return reply.code(404).send({
          message: "Comment not found",
        });
      }

      return comment;
    }
  );

  app.delete(
    "",
    {
      onRequest: app.auth([app.verifyAuthenticated]),
      schema: {
        tags: ["Entries", "Comments"],
        params: Type.Object({
          entryId: ObjectIdSchema({
            description: "ObjectId of the media entry",
          }),
          tid: Type.String({
            description: "Comment tid",
          }),
        }),
        response: {
          200: Type.Ref(AtprotoDeletionResponse),
          404: Type.Ref(ExceptionSchema),
        },
      },
    },
    async (request, reply) => {
      const { entryId, tid } = request.params;
      const entry = await app.mediaEntry.repository.findOne(
        new ObjectId(entryId)
      );
      if (!entry) {
        return reply.code(404).send({
          message: "Entry not found",
        });
      }

      return await app.mediaEntry.comments.service.deleteComment(
        tid,
        request.atproto,
        request.log
      );
    }
  );

  app.post(
    "/like",
    {
      onRequest: app.auth([app.verifyAuthenticated]),
      schema: {
        tags: ["Entries", "Comments"],
        params: Type.Object({
          entryId: ObjectIdSchema({
            description: "ObjectId of the media entry",
          }),
          tid: Type.String({
            description: "Comment tid",
          }),
        }),
        response: {
          201: Type.Ref(CommentLikeResponse),
          400: Type.Ref(ExceptionSchema),
          404: Type.Ref(ExceptionSchema),
        },
      },
    },
    async (request, reply) => {
      const { entryId, tid } = request.params;
      const entry = await app.mediaEntry.repository.findOne(
        new ObjectId(entryId)
      );
      if (!entry) {
        return reply.code(404).send({
          message: "Entry not found",
        });
      }

      const comment = await app.mediaEntry.comments.repository.findOne(
        {
          entrySlug: entry.slug,
          tid,
        },
        request.atproto.did as AtprotoDid | undefined
      );

      if (!comment) {
        return reply.code(404).send({
          message: "Comment not found",
        });
      }

      if (comment.liked) {
        return reply.code(400).send({
          message: "Comment already liked",
        });
      }

      const likeResponse = await app.mediaEntry.comments.service.like(
        tid,
        request.atproto,
        request.log
      );
      reply.code(201);
      return likeResponse;
    }
  );

  app.delete(
    "/like",
    {
      onRequest: app.auth([app.verifyAuthenticated]),
      schema: {
        description: "Remove a previous like from a comment",
        tags: ["Entries", "Comments"],
        params: Type.Object({
          entryId: ObjectIdSchema({
            description: "ObjectId of the media entry",
          }),
          tid: Type.String({
            description: "Comment tid",
          }),
        }),
        response: {
          200: Type.Ref(AtprotoDeletionResponse),
          404: Type.Ref(ExceptionSchema),
        },
      },
    },
    async (request, reply) => {
      const { entryId, tid } = request.params;
      const entry = await app.mediaEntry.repository.findOne(
        new ObjectId(entryId)
      );
      if (!entry) {
        return reply.code(404).send({
          message: "Entry not found",
        });
      }

      const comment = await app.mediaEntry.comments.repository.findOne({
        entrySlug: entry.slug,
        tid,
      });
      if (!comment) {
        return reply.code(404).send({
          message: "Comment not found",
        });
      }

      return await app.mediaEntry.comments.service.dislike(
        tid,
        request.atproto,
        request.log
      );
    }
  );
};

export default entryCommentTidRoutes;
