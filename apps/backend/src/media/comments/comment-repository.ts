import { Collection, Db, Filter } from "mongodb";
import { AtprotoDid } from "@atproto/oauth-client-node";
import { CommentEntity } from "./entities/comment";
import { CommentLikeEntity } from "./entities/comment-like";
import { omit, pick } from "~/common/utilities/functional";
import { PaginatedSearch } from "~/common/types/paginated-search";
import { StoredUser, User } from "~/common/auth/entities/user";
import { DomainEventEmitter } from "~/common/events/typed-event-emitter";

export const COMMENT_COLLECTION = "comments";
export const COMMENT_LIKE_COLLECTION = "comment-likes";

type CommentWithAuthor = CommentEntity & {
  createdBy: StoredUser;
  liked: boolean;
};

export class CommentRepository {
  private readonly commentsCollection: Collection<CommentEntity>;
  private readonly commentLikesCollection: Collection<CommentLikeEntity>;
  private readonly usersCollection: Collection<StoredUser>;
  constructor(
    db: Db,
    private readonly eventEmitter: DomainEventEmitter
  ) {
    this.commentsCollection = db.collection(COMMENT_COLLECTION);
    this.commentLikesCollection = db.collection(COMMENT_LIKE_COLLECTION);
    this.usersCollection = db.collection("users");
  }

  async save(comment: CommentEntity) {
    await this.commentsCollection.updateOne(
      { tid: comment.tid },
      { $set: pick(comment, ["text"]), $setOnInsert: omit(comment, ["text"]) },
      { upsert: true }
    );
  }

  async saveMany(comments: CommentEntity[]) {
    if (!comments.length) {
      return;
    }
    await this.commentsCollection.bulkWrite(
      comments.map((comment) => ({
        updateOne: {
          filter: { tid: comment.tid },
          update: {
            $set: pick(comment, ["text"]),
            $setOnInsert: omit(comment, ["text"]),
          },
          upsert: true,
        },
      }))
    );
  }

  async countLikesForCommentTids(commentTids: string[]) {
    return await this.commentLikesCollection
      .aggregate()
      .match({ commentTid: { $in: commentTids } })
      .group({ _id: "$commentTid", count: { $sum: 1 } })
      .project<{ commentTid: string; count: number }>({
        _id: 0,
        commentTid: "$_id",
        count: 1,
      })
      .toArray();
  }

  async findOne(
    filters: Filter<CommentEntity>,
    userDid?: AtprotoDid
  ): Promise<CommentWithAuthor | null> {
    const comment = await this.commentsCollection.findOne(filters);
    if (!comment) {
      return null;
    }

    const author = await this.usersCollection.findOne({
      did: comment.createdByDid,
    });
    if (!author) {
      throw new Error("Comment author not found");
    }
    const like = userDid
      ? await this.commentLikesCollection.findOne({
          commentTid: comment.tid,
          createdByDid: userDid,
        })
      : null;
    const liked = !!like;

    return {
      ...comment,
      createdBy: author,
      liked,
    };
  }

  async findMany(
    filters: Filter<CommentEntity>,
    { skip, limit, userDid }: PaginatedSearch & { userDid?: AtprotoDid }
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

    const likedComments = userDid
      ? await this.commentLikesCollection
          .find({
            createdByDid: userDid,
            commentTid: { $in: documents.map((doc) => doc.tid) },
          })
          .toArray()
      : [];
    const likedCommentTids = new Set(
      likedComments.map((like) => like.commentTid)
    );

    return documents.map((document) => ({
      ...document,
      createdBy: new User(document.createdBy),
      liked: likedCommentTids.has(document.tid),
    }));
  }

  async findLike(commentTid: string, userDid: AtprotoDid) {
    const document = await this.commentLikesCollection.findOne({
      commentTid,
      createdByDid: userDid,
    });
    return document ? new CommentLikeEntity(document) : null;
  }

  /** Adds a comment like associated with a comment */
  async like({
    tid,
    commentTid,
    createdByDid,
  }: Pick<CommentLikeEntity, "commentTid" | "tid" | "createdByDid">) {
    const existingLike = await this.commentsCollection.countDocuments({
      commentTid,
      createdByDid,
    });

    if (existingLike) {
      return false;
    }

    const commentLike = new CommentLikeEntity({
      tid,
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

  async importLikes(likes: CommentLikeEntity[]) {
    if (!likes.length) {
      return;
    }
    await this.commentLikesCollection.bulkWrite(
      likes.map((like) => ({
        updateOne: {
          filter: {
            tid: like.tid,
            createdByDid: like.createdByDid,
          },
          update: { $set: like },
          upsert: true,
        },
      }))
    );
  }

  /** Removes a comment like associated with a comment */
  async removeLike(tid: string, userDid: AtprotoDid) {
    const result = await this.commentLikesCollection.deleteOne({
      commentTid: tid,
      createdByDid: userDid,
    });

    const deleted = !!result.deletedCount;
    if (deleted) {
      this.eventEmitter.emit("comment.like-removed", {
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
