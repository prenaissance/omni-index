import { Collection, Db, ObjectId } from "mongodb";
import { Entry } from "../entities";
import { PaginatedSearch } from "~/common/types/paginated-search";

export class EntryRepository {
  private readonly collection: Collection<Entry>;
  constructor(db: Db) {
    this.collection = Entry.getCollection(db);
  }

  async has(id: ObjectId) {
    const count = await this.collection.countDocuments({ _id: id });
    return !!count;
  }

  async hasSlug(slug: string) {
    const count = await this.collection.countDocuments({ slug });
    return !!count;
  }

  async findOne(id: ObjectId) {
    const document = await this.collection.findOne({ _id: id });
    if (!document) {
      return null;
    }
    return Entry.fromDocument(document);
  }

  async findMany({ skip, limit }: PaginatedSearch) {
    const documents = await this.collection
      .find({})
      .skip(skip)
      .limit(limit)
      .toArray();
    const total = await this.collection.countDocuments();
    const entries = documents.map(Entry.fromDocument);
    return {
      entries,
      total,
    };
  }

  async findGenres() {
    const genres = await this.collection.distinct("genres");
    return genres;
  }

  /**
   * @throws {import("mongodb").MongoServerError} if the entry already exists
   */
  async create(entry: Entry) {
    await this.collection.insertOne(entry);
    return entry;
  }

  async update(entry: Entry) {
    await this.collection.updateOne(
      {
        _id: entry._id,
      },
      {
        $set: {
          ...entry,
          updatedAt: new Date(),
        },
      }
    );
  }

  async delete(id: ObjectId) {
    const result = await this.collection.deleteOne({ _id: id });
    return result.deletedCount !== 0;
  }
}
