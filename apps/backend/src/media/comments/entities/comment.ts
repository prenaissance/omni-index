import { ObjectId } from "mongodb";
import { AtprotoDid } from "@atproto/oauth-client-node";
import { Entity, EntityInit } from "~/common/entities/entity";
import * as Comment from "~/atproto/types/com/omni-index/comment";

export type CommentInit = EntityInit & {
  entryId: ObjectId;
  tid: string;
  text: string;
  createdAt: Date;
  createdByDid: AtprotoDid;
};

export class CommentEntity
  extends Entity
  implements Pick<Comment.Record, "text">
{
  readonly tid: string;
  readonly entryId: ObjectId;
  readonly text: string;
  readonly createdAt: Date;
  readonly createdByDid: AtprotoDid;

  constructor({
    _id,
    entryId,
    tid,
    createdAt,
    text,
    createdByDid,
  }: CommentInit) {
    super({ _id });
    this.tid = tid;
    this.entryId = entryId;
    this.text = text;
    this.createdAt = new Date(createdAt);
    this.createdByDid = createdByDid;
  }
}
