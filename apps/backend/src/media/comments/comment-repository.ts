import { Collection, Db, Filter, FindOptions } from "mongodb";
import { CommentEntity } from "./entities/comment";
import { omit, pick } from "~/common/utilities/functional";

export const COMMENT_COLLECTION = "comments";

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

  async findMany(filters: Filter<CommentEntity>, options?: FindOptions) {
    const documents = await this.collection.find(filters, options).toArray();
    return documents.map((document) => new CommentEntity(document));
  }

  async deleteOne(filters: Filter<CommentEntity>) {
    const result = await this.collection.deleteOne(filters);

    return !!result.deletedCount;
  }
}
