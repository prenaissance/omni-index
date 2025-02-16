import { AtprotoDid } from "@atproto/oauth-client-node";
import { UserRole } from "./enums/user-role";
import { Entity, EntityInit } from "~/common/entities/entity";

type UserInit = EntityInit & {
  did: AtprotoDid;
  role: UserRole;
  displayName?: string;
  description?: string;
  avatarCid?: string;
  bannerCid?: string;
};

export type StoredUser = Pick<
  User,
  | "_id"
  | "did"
  | "role"
  | "displayName"
  | "description"
  | "avatarCid"
  | "bannerCid"
>;

export class User extends Entity {
  readonly did: AtprotoDid;
  role: UserRole;
  displayName?: string;
  description?: string;
  avatarCid?: string;
  bannerCid?: string;

  constructor({
    _id,
    did,
    role,
    displayName,
    description,
    avatarCid,
    bannerCid,
  }: UserInit) {
    super({ _id });
    this.did = did;
    this.role = role;
    this.displayName = displayName;
    this.description = description;
    this.avatarCid = avatarCid;
    this.bannerCid = bannerCid;
  }

  get avatar() {
    // use com.atproto.sync.getBlob if this becomes troublesome
    if (!this.avatarCid) {
      return null;
    }
    return `https://cdn.bsky.app/img/avatar/plain/${this.did}/${this.avatarCid}`;
  }

  get avatarThumbnail() {
    if (!this.avatarCid) {
      return null;
    }
    return `https://cdn.bsky.app/img/avatar_thumbnail/plain/${this.did}/${this.avatarCid}`;
  }
}
