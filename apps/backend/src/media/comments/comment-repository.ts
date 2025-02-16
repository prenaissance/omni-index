import { Collection, Db, Filter } from "mongodb";
import { CommentEntity } from "./entities/comment";
import { omit, pick } from "~/common/utilities/functional";
import { PaginatedSearch } from "~/common/types/paginated-search";
import { StoredUser, User } from "~/common/auth/entities/user";

export const COMMENT_COLLECTION = "comments";

type CommentWithAuthor = CommentEntity & { createdBy: StoredUser };

export class CommentRepository {
  private readonly collection: Collection<CommentEntity>;
  constructor(db: Db) {
    this.collection = db.collection(COMMENT_COLLECTION);
  }

  async save(comment: CommentEntity) {
    await this.collection.updateOne(
      { tid: comment.tid },
      { $set: pick(comment, ["text"]), $setOnInsert: omit(comment, ["text"]) },
      { upsert: true }
    );
  }

  async findMany(
    filters: Filter<CommentEntity>,
    { skip, limit }: PaginatedSearch
  ): Promise<CommentWithAuthor[]> {
    const documents = await this.collection
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

  async deleteOne(filters: Filter<CommentEntity>) {
    const result = await this.collection.deleteOne(filters);

    return !!result.deletedCount;
  }
}
