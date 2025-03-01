import { Agent } from "@atproto/api";
import { AtprotoDid } from "@atproto/oauth-client-node";
import { FastifyBaseLogger } from "fastify";
import { TID } from "@atproto/common";
import { CommentRepository } from "./comment-repository";
import { CommentLikeRemovedEvent, CommentLikedEvent } from "./events";
import { DomainEventEmitter } from "~/common/events/typed-event-emitter";
import { AtprotoDeletionResponse } from "~/common/payloads";
import * as CommentLike from "~/atproto/types/com/omni-index/comment/like";

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
