import { Collection, Db, ObjectId } from "mongodb";
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

  async getEntryComments(entryId: ObjectId) {
    return this.collection.find({ entryId }).toArray();
  }
}
