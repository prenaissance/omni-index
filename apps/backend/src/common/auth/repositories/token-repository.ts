import { Collection, Db } from "mongodb";
import { AtprotoDid } from "@atproto/oauth-client-node";
import { TemporaryToken } from "../entities/temporary-token";

export const TEMPORARY_TOKENS_COLLECTION = "temporary-tokens";

export class TokenRepository {
  private readonly temporaryTokenCollection: Collection<TemporaryToken>;

  constructor(db: Db) {
    this.temporaryTokenCollection = db.collection(TEMPORARY_TOKENS_COLLECTION);
  }

  /** @returns the generated token */
  async generateToken(userDid: AtprotoDid) {
    const temporaryToken = new TemporaryToken({ userDid });
    await this.temporaryTokenCollection.insertOne(temporaryToken);
    return temporaryToken.token;
  }

  async getToken(token: string) {
    return await this.temporaryTokenCollection.findOne({ token });
  }

  async consumeToken(token: string) {
    await this.temporaryTokenCollection.deleteOne({ token });
  }
}
