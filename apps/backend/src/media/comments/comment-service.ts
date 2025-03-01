import { Agent } from "@atproto/api";
import { AtprotoDid } from "@atproto/oauth-client-node";
import { CommentRepository } from "./comment-repository";
import { CommentLikeRemovedEvent, CommentLikedEvent } from "./events";
import { DomainEventEmitter } from "~/common/events/typed-event-emitter";
import { AtprotoDeletionResponse } from "~/common/payloads";

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

  async dislike(
    commentTid: string,
    atproto: Agent
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

      return "commit" in response.data;
    };

    const [locallyDeleted, atprotoDeleted] = await Promise.all([
      this.commentRepository.removeLike(existingCommentLike.tid, did),
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
