import { Agent } from "@atproto/api";
import { AtprotoDid } from "@atproto/oauth-client-node";
import { FastifyBaseLogger } from "fastify";
import { TID } from "@atproto/common";
import { CommentRepository } from "./comment-repository";
import { CommentLikeRemovedEvent, CommentLikedEvent } from "./events";
import { CommentEntity } from "./entities";
import { CommentLikeEntity } from "./entities/comment-like";
import { DomainEventEmitter } from "~/common/events/typed-event-emitter";
import { AtprotoDeletionResponse } from "~/common/payloads";
import * as Comment from "~/atproto/types/com/omni-index/comment";
import * as CommentLike from "~/atproto/types/com/omni-index/comment/like";

type RepoListRecord = Awaited<
  ReturnType<Agent["com"]["atproto"]["repo"]["listRecords"]>
>["data"]["records"][number];

export class CommentService implements Disposable {
  private readonly unsubscribe: () => void;
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly eventEmitter: DomainEventEmitter
  ) {
    const likeHandler = this.likedHandler.bind(this);
    const removeLikeHandler = this.removeLikeHandler.bind(this);

    this.eventEmitter.on("comment.liked", likeHandler);
    this.eventEmitter.on("comment.like-removed", removeLikeHandler);

    this.unsubscribe = () => {
      this.eventEmitter.off("comment.liked", likeHandler);
      this.eventEmitter.off("comment.like-removed", removeLikeHandler);
    };
  }

  /**
   * @throws {ValidationError} if the comment record is invalid
   */
  async createComment(
    comment: CommentEntity,
    atproto: Agent,
    logger: FastifyBaseLogger
  ) {
    const record: Comment.Record = {
      entrySlug: comment.entrySlug,
      text: comment.text,
      createdAt: comment.createdAt.toISOString(),
    };

    const validationResult = Comment.validateRecord(record);
    if (!validationResult.success) {
      throw validationResult.error;
    }

    const {
      data: { uri },
    } = await atproto.com.atproto.repo.putRecord({
      repo: atproto.assertDid,
      collection: "com.omni-index.comment",
      record,
      rkey: comment.tid,
      validate: false,
    });
    logger.info({
      msg: "Comment record created",
      entrySlug: comment.entrySlug,
      uri,
    });

    await this.commentRepository.save(comment);
  }

  // async importComments() {}

  async deleteComment(
    tid: string,
    atproto: Agent,
    logger: FastifyBaseLogger
  ): Promise<AtprotoDeletionResponse> {
    const did = atproto.assertDid as AtprotoDid;
    const deleteLocally = () =>
      this.commentRepository.deleteOne({
        tid,
        createdByDid: did,
      });

    const deleteAtproto = async () => {
      const response = await atproto.com.atproto.repo.deleteRecord({
        repo: did,
        collection: "com.omni-index.comment",
        rkey: tid,
      });

      logger.debug({
        msg: "Comment record deleted",
        tid,
      });

      return "commit" in response.data;
    };

    const [locallyDeleted, atprotoDeleted] = await Promise.all([
      deleteLocally(),
      deleteAtproto(),
    ]);

    return { locallyDeleted, atprotoDeleted };
  }

  async importComments(userAtproto: Agent, logger: FastifyBaseLogger) {
    const did = userAtproto.assertDid as AtprotoDid;
    const recordsResponse = await userAtproto.com.atproto.repo.listRecords({
      repo: did,
      collection: "com.omni-index.comment",
      limit: 100,
    });

    // TODO: implement pagination
    const { records, cursor: _cursor } = recordsResponse.data;
    const invalidRecords: RepoListRecord[] = [];
    const validRecords: { rkey: string; comment: Comment.Record }[] = [];
    for (const record of records) {
      const tid = record.uri.split("/").at(-1)!;
      const commentRecord = record.value;
      if (!Comment.isRecord(commentRecord)) {
        invalidRecords.push(record);
        continue;
      }

      const validationResult = Comment.validateRecord(commentRecord);
      if (!validationResult.success) {
        invalidRecords.push(record);
        continue;
      }

      validRecords.push({ rkey: tid, comment: commentRecord });
    }

    if (invalidRecords.length) {
      logger.debug({
        msg: "Several invalid comment records could not be imported",
        did,
        uris: invalidRecords.map((r) => r.uri),
      });
    }
    const commentTids = validRecords.map((r) => r.rkey);
    const likeCounts =
      await this.commentRepository.countLikesForCommentTids(commentTids);
    const likesMap = new Map(
      likeCounts.map((like) => [like.commentTid, like.count])
    );

    const comments = validRecords.map(
      ({ rkey, comment }) =>
        new CommentEntity({
          tid: rkey,
          entrySlug: comment.entrySlug,
          text: comment.text,
          createdByDid: did,
          createdAt: new Date(comment.createdAt),
          likes: likesMap.get(rkey) ?? 0,
        })
    );

    await this.commentRepository.saveMany(comments);
    logger.info({
      msg: "Imported comments for new user",
      did,
      count: comments.length,
    });
  }

  async importCommentLikes(userAtproto: Agent, logger: FastifyBaseLogger) {
    const did = userAtproto.assertDid as AtprotoDid;
    const recordsResponse = await userAtproto.com.atproto.repo.listRecords({
      repo: did,
      collection: "com.omni-index.comment.like",
      limit: 100,
    });

    // TODO: implement pagination
    const { records, cursor: _cursor } = recordsResponse.data;
    const invalidRecords: RepoListRecord[] = [];
    const validRecords: CommentLike.Record[] = [];
    for (const record of records) {
      const commentLikeRecord = record.value;
      if (!CommentLike.isRecord(commentLikeRecord)) {
        invalidRecords.push(record);
        continue;
      }

      const validationResult = CommentLike.validateRecord(commentLikeRecord);
      if (!validationResult.success) {
        invalidRecords.push(record);
        continue;
      }

      validRecords.push(commentLikeRecord);
    }

    if (invalidRecords.length) {
      logger.debug({
        msg: "Several invalid comment like records could not be imported",
        did,
        uris: invalidRecords.map((r) => r.uri),
      });
    }

    const likes = validRecords.map(
      (record) =>
        new CommentLikeEntity({
          tid: TID.nextStr(),
          commentTid: record.commentUri.split("/").at(-1)!,
          createdByDid: did,
          createdAt: new Date(record.createdAt),
        })
    );
    await this.commentRepository.importLikes(likes);
    logger.info({
      msg: "Imported comment likes for new user",
      did,
      count: likes.length,
    });
  }

  async like(commentTid: string, atproto: Agent, logger: FastifyBaseLogger) {
    const did = atproto.assertDid as AtprotoDid;
    const likeTid = TID.nextStr();
    const commentUri = `at://${did}/com.omni-index.comment/${commentTid}`;
    const record: CommentLike.Record = {
      commentUri,
      createdAt: new Date().toISOString(),
    };

    const {
      data: { uri },
    } = await atproto.com.atproto.repo.putRecord({
      repo: atproto.assertDid,
      collection: "com.omni-index.comment.like",
      record,
      rkey: likeTid,
      validate: false,
    });
    logger.debug({
      msg: "Comment like record created",
      commentUri,
      uri,
    });

    await this.commentRepository.like({
      tid: likeTid,
      commentTid,
      createdByDid: atproto.assertDid as AtprotoDid,
    });

    return {
      tid: likeTid,
      uri,
    };
  }

  async dislike(
    commentTid: string,
    atproto: Agent,
    logger: FastifyBaseLogger
  ): Promise<AtprotoDeletionResponse> {
    const did = atproto.assertDid as AtprotoDid;
    const existingCommentLike = await this.commentRepository.findLike(
      commentTid,
      did
    );
    if (!existingCommentLike) {
      return {
        locallyDeleted: false,
        atprotoDeleted: false,
      };
    }

    const deleteAtproto = async () => {
      const response = await atproto.com.atproto.repo.deleteRecord({
        repo: did,
        collection: "com.omni-index.comment.like",
        rkey: existingCommentLike.tid,
      });
      logger.debug({
        msg: "Comment like record deleted",
        commentLike: existingCommentLike,
      });

      return "commit" in response.data;
    };

    const [locallyDeleted, atprotoDeleted] = await Promise.all([
      this.commentRepository.removeLike(commentTid, did),
      deleteAtproto(),
    ]);

    return { locallyDeleted, atprotoDeleted };
  }

  private async likedHandler(event: CommentLikedEvent) {
    this.commentRepository.incrementLikes(event.commentTid);
  }

  private async removeLikeHandler(event: CommentLikeRemovedEvent) {
    this.commentRepository.decrementLikes(event.commentTid);
  }

  [Symbol.dispose]() {
    this.unsubscribe();
  }
}
