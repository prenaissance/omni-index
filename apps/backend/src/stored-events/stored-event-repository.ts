import { Collection, Db, Filter, FindOptions, ObjectId } from "mongodb";
import { StoredEvent } from "./entities/stored-event";

export const STORED_EVENTS_COLLECTION = "stored-events";

export class StoredEventRepository {
  private readonly collection: Collection<StoredEvent>;
  constructor(db: Db) {
    this.collection = db.collection(STORED_EVENTS_COLLECTION);
  }

  /**
   * Add or update stored event.
   */
  async save(storedEvent: StoredEvent) {
    const filter = { _id: storedEvent._id };
    await this.collection.updateOne(
      filter,
      { $set: storedEvent },
      { upsert: true }
    );
  }

  async findOne(
    filter: Filter<StoredEvent>,
    options?: FindOptions
  ): Promise<StoredEvent | null> {
    const document = await this.collection.findOne(filter, options);
    return document ? StoredEvent.fromDocument(document) : null;
  }

  async existsId(id: ObjectId) {
    const document = await this.collection.findOne({ _id: id });
    return !!document;
  }

  async count(filter: Filter<StoredEvent>) {
    return await this.collection.countDocuments(filter);
  }

  async findMany(filter: Filter<StoredEvent>, options?: FindOptions) {
    const documents = await this.collection.find(filter, options).toArray();
    return documents.map(StoredEvent.fromDocument);
  }

  async deleteMany(filter: Filter<StoredEvent>) {
    const result = await this.collection.deleteMany(filter);
    return result.deletedCount;
  }
}
