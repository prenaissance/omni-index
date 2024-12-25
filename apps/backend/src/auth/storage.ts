import type {
  NodeSavedSession,
  NodeSavedSessionStore,
  NodeSavedState,
  NodeSavedStateStore,
} from "@atproto/oauth-client-node";
import type { Collection, Db, WithId } from "mongodb";

export class MongoStateStore implements NodeSavedStateStore {
  private readonly collection: Collection<
    WithId<NodeSavedState> & { key: string }
  >;
  constructor(db: Db) {
    this.collection = db.collection("oauth-state");
  }

  async get(key: string): Promise<NodeSavedState | undefined> {
    const doc = await this.collection.findOne({ key });
    return doc ?? undefined;
  }

  async set(key: string, value: NodeSavedState): Promise<void> {
    await this.collection.updateOne(
      { key },
      {
        $set: {
          ...value,
          key,
        },
      },
      { upsert: true },
    );
  }

  async del(key: string): Promise<void> {
    await this.collection.deleteOne({ key });
  }

  async clear(): Promise<void> {
    await this.collection.deleteMany({});
  }
}

export class MongoSessionStore implements NodeSavedSessionStore {
  private readonly collection: Collection<
    WithId<NodeSavedSession> & { key: string }
  >;

  constructor(db: Db) {
    this.collection = db.collection("oauth-sessions");
  }

  async get(key: string): Promise<NodeSavedSession | undefined> {
    const doc = await this.collection.findOne({ key });
    return doc ?? undefined;
  }

  async set(key: string, value: NodeSavedSession): Promise<void> {
    await this.collection.updateOne(
      {
        key,
      },
      {
        $set: {
          ...value,
          key,
        },
      },
      {
        upsert: true,
      },
    );
  }

  async del(key: string): Promise<void> {
    await this.collection.deleteOne({ key });
  }

  async clear(): Promise<void> {
    await this.collection.deleteMany({});
  }
}
