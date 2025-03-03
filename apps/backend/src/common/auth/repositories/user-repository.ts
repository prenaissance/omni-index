import { Collection, Db, Filter } from "mongodb";
import { AtprotoDid } from "@atproto/oauth-client-node";
import { StoredUser, User } from "../entities/user";

export const USERS_COLLECTION = "users";

export class UserRepository {
  private readonly usersCollection: Collection<StoredUser>;
  constructor(db: Db) {
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

  async findOne(filter: Filter<StoredUser>) {
    const user = await this.usersCollection.findOne(filter);
    if (!user) {
      return null;
    }

    return new User(user);
  }

  async getByDid(did: AtprotoDid) {
    const user = await this.usersCollection.findOne({ did });
    if (!user) {
      return null;
    }

    return new User(user);
  }
}
