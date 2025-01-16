import { Did } from "@atproto/api";
import { customAlphabet } from "nanoid";
import { Entity, EntityInit } from "~/common/entities/entity";

const nanoid = customAlphabet(
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  32
);
const TEMPORARY_TOKEN_EXPIRATION_SECONDS = 5 * 60; // 5 minutes

export type TemporaryTokenInit = EntityInit & {
  userDid: Did;
  token?: string;
  expiresAt?: Date;
};

export class TemporaryToken extends Entity {
  readonly userDid: Did;
  readonly token: string;
  readonly expiresAt: Date;

  constructor({ _id, userDid, token, expiresAt }: TemporaryTokenInit) {
    super({ _id });
    this.userDid = userDid;
    this.token = token ?? nanoid();
    this.expiresAt =
      expiresAt ??
      new Date(Date.now() + TEMPORARY_TOKEN_EXPIRATION_SECONDS * 1000);
  }

  static generateRawToken() {
    return nanoid();
  }
}
