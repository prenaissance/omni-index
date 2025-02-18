import { Collection, Db, Filter } from "mongodb";
import { AtprotoDid } from "@atproto/oauth-client-node";
import { CommentEntity } from "./entities/comment";
import { CommentLike } from "./entities/comment-like";
import { omit, pick } from "~/common/utilities/functional";
import { PaginatedSearch } from "~/common/types/paginated-search";
import { StoredUser, User } from "~/common/auth/entities/user";
import { DomainEventEmitter } from "~/common/events/typed-event-emitter";

export const COMMENT_COLLECTION = "comments";
export const COMMENT_LIKE_COLLECTION = "comment-likes";

type CommentWithAuthor = CommentEntity & { createdBy: StoredUser };

export class CommentRepository {
  private readonly commentsCollection: Collection<CommentEntity>;
  private readonly commentLikesCollection: Collection<CommentLike>;
  constructor(
    db: Db,
    private readonly eventEmitter: DomainEventEmitter
  ) {
    this.commentsCollection = db.collection(COMMENT_COLLECTION);
    this.commentLikesCollection = db.collection(COMMENT_LIKE_COLLECTION);
  }

  async save(comment: CommentEntity) {
    await this.commentsCollection.updateOne(
      { tid: comment.tid },
      { $set: pick(comment, ["text"]), $setOnInsert: omit(comment, ["text"]) },
      { upsert: true }
    );
  }

  async findMany(
    filters: Filter<CommentEntity>,
    { skip, limit }: PaginatedSearch
  ): Promise<CommentWithAuthor[]> {
    const documents = await this.commentsCollection
      .aggregate()
      .match(filters)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lookup({
        from: "users",
        localField: "createdByDid",
        foreignField: "did",
        as: "createdBy",
      })
      .addStage<CommentWithAuthor>({
        $addFields: { createdBy: { $arrayElemAt: ["$createdBy", 0] } },
      })
      .toArray();

    return documents.map((document) => ({
      ...document,
      createdBy: new User(document.createdBy),
    }));
  }

  async findLike(commentTid: string, userDid: AtprotoDid) {
    const document = await this.commentLikesCollection.findOne({
      commentTid,
      createdByDid: userDid,
    });
    return document ? new CommentLike(document) : null;
  }

  /** Adds a comment like associated with a comment */
  async like({
    did,
    commentTid,
    createdByDid,
  }: Pick<CommentLike, "commentTid" | "tid" | "createdByDid">) {
    const existingLike = await this.commentsCollection.countDocuments({
      commentTid,
      createdByDid,
    });

    if (existingLike) {
      return false;
    }

    const commentLike = new CommentLike({
      did,
      commentTid,
      createdByDid,
    });

    await this.commentLikesCollection.insertOne(commentLike);

    this.eventEmitter.emit("comment.liked", {
      commentTid: commentLike.commentTid,
      createdByDid: commentLike.createdByDid,
      createdAt: commentLike.createdAt,
    });

    return true;
  }

  /** Removes a comment like associated with a comment */
  async dislike(tid: string, userDid: AtprotoDid) {
    const result = await this.commentLikesCollection.deleteOne({
      commentTid: tid,
      createdByDid: userDid,
    });

    const deleted = !!result.deletedCount;
    if (deleted) {
      this.eventEmitter.emit("comment.disliked", {
        commentTid: tid,
        createdByDid: userDid,
      });
    }

    return deleted;
  }

  async incrementLikes(tid: string) {
    await this.commentsCollection.updateOne({ tid }, { $inc: { likes: 1 } });
  }

  async decrementLikes(tid: string) {
    await this.commentsCollection.updateOne({ tid }, { $inc: { likes: -1 } });
  }

  async deleteOne(filters: Filter<CommentEntity>) {
    const result = await this.commentsCollection.deleteOne(filters);

    return !!result.deletedCount;
  }
}
