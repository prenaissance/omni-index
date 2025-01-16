import { Collection, Db } from "mongodb";

type ConfigEntity<T = unknown> = {
  _id: string;
  data: T;
};

export const CONFIG_COLLECTION = "config";

export class ConfigStorage {
  private readonly collection: Collection<ConfigEntity>;

  constructor(db: Db) {
    this.collection = db.collection(CONFIG_COLLECTION);
  }

  async get<T = unknown>(key: string) {
    const document = await this.collection.findOne({ _id: key });
    return (document?.data ?? null) as T | null;
  }

  async set<T = unknown>(key: string, value: T) {
    await this.collection.updateOne(
      { _id: key },
      { $set: { data: value } },
      { upsert: true }
    );
  }
}
