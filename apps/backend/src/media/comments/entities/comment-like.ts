import { AtprotoDid } from "@atproto/oauth-client-node";
import { Entity, EntityInit } from "~/common/entities/entity";

export type CommentLikeInit = EntityInit & {
  tid: string;
  commentTid: string;
  createdByDid: AtprotoDid;
  createdAt?: Date;
};

export class CommentLikeEntity extends Entity {
  readonly tid: string;
  readonly commentTid: string;
  readonly createdByDid: AtprotoDid;
  readonly createdAt: Date;

  constructor({
    _id,
    tid,
    commentTid,
    createdByDid,
    createdAt,
  }: CommentLikeInit) {
    super({ _id });
    this.tid = tid;
    this.commentTid = commentTid;
    this.createdByDid = createdByDid;
    this.createdAt = createdAt ? new Date(createdAt) : new Date();
  }
}
