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
import { ObjectIdSchema } from "~/common/payloads";

const entryCommentRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.addSchema(CreateCommentRequest);

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
        entryId: request.params.entryId,
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
          message: "Invalid comment",
          error: validationResult.error.message,
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
        uri,
      });

      await app.mediaEntry.comments.repository.save(comment);

      return reply.code(201).send(comment);
    }
  );
};

export default entryCommentRoutes;
