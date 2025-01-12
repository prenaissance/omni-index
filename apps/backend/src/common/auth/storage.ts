import type {
  NodeSavedSession,
  NodeSavedSessionStore,
  NodeSavedState,
  NodeSavedStateStore,
} from "@atproto/oauth-client-node";
import type { Collection, Db, WithId } from "mongodb";

export const OAUTH_STATES_COLLECTION = "oauth-states";

export class MongoStateStore implements NodeSavedStateStore {
  private readonly collection: Collection<
    WithId<NodeSavedState> & { key: string }
  >;
  constructor(db: Db) {
    this.collection = db.collection(OAUTH_STATES_COLLECTION);
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
      { upsert: true }
    );
  }

  async del(key: string): Promise<void> {
    await this.collection.deleteOne({ key });
  }

  async clear(): Promise<void> {
    await this.collection.deleteMany({});
  }
}

export const OAUTH_SESSIONS_COLLECTION = "oauth-sessions";

export class MongoSessionStore implements NodeSavedSessionStore {
  private readonly collection: Collection<
    WithId<NodeSavedSession> & { key: string }
  >;

  constructor(db: Db) {
    this.collection = db.collection(OAUTH_SESSIONS_COLLECTION);
  }

  async get(key: string): Promise<NodeSavedSession | undefined> {
    const doc = await this.collection.findOne({
      "tokenSet.sub": key,
    });
    return doc ?? undefined;
  }

  async set(key: string, value: NodeSavedSession): Promise<void> {
    await this.collection.updateOne(
      {
        "tokenSet.sub": key,
      },
      {
        $set: value,
      },
      {
        upsert: true,
      }
    );
  }

  async del(key: string): Promise<void> {
    await this.collection.deleteOne({ "tokenSet.sub": key });
  }

  async clear(): Promise<void> {
    await this.collection.deleteMany({});
  }
}
