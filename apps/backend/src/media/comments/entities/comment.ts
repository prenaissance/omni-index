import { AtprotoDid } from "@atproto/oauth-client-node";
import { Entity, EntityInit } from "~/common/entities/entity";
import * as Comment from "~/atproto/types/com/omni-index/comment";

export type CommentInit = EntityInit & {
  entrySlug: string;
  tid: string;
  text: string;
  createdAt?: Date;
  createdByDid: AtprotoDid;
  likes?: number;
};

export class CommentEntity
  extends Entity
  implements Pick<Comment.Record, "text">
{
  readonly tid: string;
  readonly entrySlug: string;
  readonly text: string;
  readonly createdAt: Date;
  readonly createdByDid: AtprotoDid;
  readonly likes: number;

  constructor({
    _id,
    entrySlug,
    tid,
    createdAt,
    text,
    createdByDid,
    likes,
  }: CommentInit) {
    super({ _id });
    this.tid = tid;
    this.entrySlug = entrySlug;
    this.text = text;
    this.createdAt = createdAt ?? new Date();
    this.createdByDid = createdByDid;
    this.likes = likes ?? 0;
  }
}
