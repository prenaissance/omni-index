import { TID } from "@atproto/common";
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
import * as CommentLike from "~/atproto/types/com/omni-index/comment/like";
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

      const deleteLocally = () =>
        app.mediaEntry.comments.repository.deleteOne({
          entrySlug: entry.slug,
          tid,
          createdByDid: request.atproto.assertDid as AtprotoDid,
        });

      const deleteAtproto = async () => {
        const response = await request.atproto.com.atproto.repo.deleteRecord({
          repo: request.atproto.assertDid,
          collection: "com.omni-index.comment",
          rkey: tid,
        });

        return "commit" in response.data;
      };

      const [locallyDeleted, atprotoDeleted] = await Promise.all([
        deleteLocally(),
        deleteAtproto(),
      ]);
      return { locallyDeleted, atprotoDeleted };
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

      const comment = await app.mediaEntry.comments.repository.findOne({
        entrySlug: entry.slug,
        tid,
      });
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

      const likeTid = TID.nextStr();
      const commentUri = `at://did:plc:${request.atproto.assertDid}/com.omni-index.comment/${tid}`;
      const record: CommentLike.Record = {
        commentUri,
        createdAt: new Date().toISOString(),
      };

      const {
        data: { uri },
      } = await request.atproto.com.atproto.repo.putRecord({
        repo: request.atproto.assertDid,
        collection: "com.omni-index.comment-like",
        record,
        rkey: likeTid,
        validate: false,
      });
      request.log.debug({
        msg: "Comment like record created",
        commentUri,
        uri,
      });

      await app.mediaEntry.comments.repository.like({
        tid: likeTid,
        commentTid: tid,
        createdByDid: request.atproto.assertDid as AtprotoDid,
      });

      reply.code(201);
      return {
        tid: likeTid,
        uri,
      };
    }
  );
};

export default entryCommentTidRoutes;
