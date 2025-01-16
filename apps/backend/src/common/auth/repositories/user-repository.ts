import { Collection, Db } from "mongodb";
import { NodeSavedSessionStore } from "@atproto/oauth-client-node";
import { Did } from "@atproto/api";
import { StoredUser, User } from "../entities/user";

export const USERS_COLLECTION = "users";

export class UserRepository {
  private readonly usersCollection: Collection<StoredUser>;
  constructor(
    db: Db,
    private readonly sessionStore: NodeSavedSessionStore
  ) {
    this.usersCollection = db.collection(USERS_COLLECTION);
  }

  async save(user: User) {
    const { _id, did, role } = user;

    await this.usersCollection.updateOne(
      { _id },
      {
        $set: {
          _id,
          did,
          role,
        },
      },
      { upsert: true }
    );
  }

  async getByDid(did: Did) {
    const user = await this.usersCollection.findOne({ did });
    if (!user) {
      return null;
    }

    const session = await this.sessionStore.get(did);
    return new User({
      ...user,
      session,
    });
  }
}
