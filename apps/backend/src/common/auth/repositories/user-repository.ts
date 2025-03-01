import { Collection, Db } from "mongodb";
import { AtprotoDid, NodeSavedSessionStore } from "@atproto/oauth-client-node";
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
    const { _id, did, handle, role, displayName, description, avatarUrl } =
      user;

    await this.usersCollection.updateOne(
      { _id },
      {
        $set: {
          _id,
          did,
          handle,
          role,
          displayName,
          description,
          avatarUrl,
        },
      },
      { upsert: true }
    );
  }

  async getByDid(did: AtprotoDid) {
    const user = await this.usersCollection.findOne({ did });
    if (!user) {
      return null;
    }

    return new User(user);
  }
}
