import { Collection, Db } from "mongodb";
import { AtprotoDid } from "@atproto/oauth-client-node";
import { RefreshToken } from "../entities/refresh-token";

export const REFRESH_TOKENS_COLLECTION = "refresh-tokens";

export class RefreshTokenRepository {
  private readonly collection: Collection<RefreshToken>;

  constructor(db: Db) {
    this.collection = db.collection(REFRESH_TOKENS_COLLECTION);
  }

  /** @returns the generated token */
  async generateToken(userDid: AtprotoDid) {
    const token = new RefreshToken({ userDid });
    await this.collection.insertOne(token);
    return token.refreshToken;
  }

  /** @returns the new token, if the provided refresh token is valid, otherwise null */
  async reissueToken(token: string) {
    const refreshToken = await this.collection.findOne({ refreshToken: token });
    if (!refreshToken) {
      return null;
    }

    const newToken = new RefreshToken({
      userDid: refreshToken.userDid,
    });
    await this.collection.bulkWrite([
      {
        deleteOne: {
          filter: { refreshToken: token },
        },
      },
      {
        insertOne: {
          document: newToken,
        },
      },
    ]);

    return newToken;
  }
}
