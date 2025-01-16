import { Did } from "@atproto/api";
import { NodeSavedSession } from "@atproto/oauth-client-node";
import { UserRole } from "./enums/user-role";
import { Entity, EntityInit } from "~/common/entities/entity";

type UserInit = EntityInit & {
  did: Did;
  role: UserRole;
  session?: NodeSavedSession;
};

export type StoredUser = Pick<User, "_id" | "did" | "role">;

export class User extends Entity {
  readonly did: Did;
  role: UserRole;
  readonly session?: NodeSavedSession;

  constructor({ _id, did, role, session }: UserInit) {
    super({ _id });
    this.did = did;
    this.role = role;
    this.session = session;
  }
}
