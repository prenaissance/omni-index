import { AtprotoDid } from "@atproto/oauth-client-node";
import { UserRole } from "./enums/user-role";
import { Entity, EntityInit } from "~/common/entities/entity";

type UserInit = EntityInit & {
  did: AtprotoDid;
  role: UserRole;
  handle?: string;
  displayName?: string;
  description?: string;
  avatarUrl?: string;
};

export type StoredUser = Pick<
  User,
  | "_id"
  | "did"
  | "handle"
  | "role"
  | "displayName"
  | "description"
  | "avatarUrl"
>;

export class User extends Entity {
  readonly did: AtprotoDid;
  role: UserRole;
  handle?: string;
  displayName?: string;
  description?: string;
  avatarUrl?: string;

  constructor({
    _id,
    did,
    handle,
    role,
    displayName,
    description,
    avatarUrl,
  }: UserInit) {
    super({ _id });
    this.did = did;
    this.handle = handle;
    this.role = role;
    this.displayName = displayName;
    this.description = description;
    this.avatarUrl = avatarUrl;
  }
}
