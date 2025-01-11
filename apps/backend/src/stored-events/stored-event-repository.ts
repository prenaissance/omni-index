import { Collection, Db, Filter, FindOptions, ObjectId } from "mongodb";
import { StoredEvent } from "./entities/stored-event";

export const STORED_EVENT_COLLECTION = "stored_events";

export class StoredEventRepository {
  private readonly collection: Collection<StoredEvent>;
  constructor(db: Db) {
    this.collection = db.collection(STORED_EVENT_COLLECTION);
  }

  /**
   * Add a stored event. Events are immutable and cannot be updated later on.
   */
  async add(storedEvent: StoredEvent) {
    await this.collection.insertOne(storedEvent);
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
}
