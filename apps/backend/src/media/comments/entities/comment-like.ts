import { AtprotoDid } from "@atproto/oauth-client-node";
import { Entity, EntityInit } from "~/common/entities/entity";

export type CommentLikeInit = EntityInit & {
  commentTid: string;
  createdByDid: AtprotoDid;
  createdAt?: Date;
};

export class CommentLike extends Entity {
  readonly commentTid: string;
  readonly createdByDid: AtprotoDid;
  readonly createdAt: Date;

  constructor({ _id, commentTid, createdByDid, createdAt }: CommentLikeInit) {
    super({ _id });
    this.commentTid = commentTid;
    this.createdByDid = createdByDid;
    this.createdAt = createdAt ? new Date(createdAt) : new Date();
  }
}
