import { AtprotoDid } from "@atproto/oauth-client-node";
import { customAlphabet } from "nanoid";
import { Entity, EntityInit } from "~/common/entities/entity";

const nanoid = customAlphabet(
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  32
);
const REFRESH_TOKEN_EXPIRATION_SECONDS = 60 * 60 * 24 * 7; // 1 week

export type RefreshTokenInit = EntityInit & {
  userDid: AtprotoDid;
  refreshToken?: string;
  expiresAt?: Date;
};

export class RefreshToken extends Entity {
  readonly userDid: AtprotoDid;
  readonly refreshToken: string;
  readonly expiresAt: Date;

  constructor({ _id, userDid, refreshToken, expiresAt }: RefreshTokenInit) {
    super({ _id });
    this.userDid = userDid;
    this.refreshToken = refreshToken ?? RefreshToken.generateRawToken();
    this.expiresAt =
      expiresAt ??
      new Date(Date.now() + REFRESH_TOKEN_EXPIRATION_SECONDS * 1000);
  }

  static generateRawToken() {
    return `refresh_${nanoid()}`;
  }
}
