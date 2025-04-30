import { Entity, EntityInit } from "~/common/entities/entity";

export enum StoredEventStatus {
  Pending = "pending",
  Accepted = "accepted",
  Rejected = "rejected",
}

export type StoredEventInit = {
  createdAt?: Date;
  type: string;
  payload: unknown;
  nodeUrl?: string | null;
  status: StoredEventStatus;
} & EntityInit;

export class StoredEvent extends Entity {
  readonly createdAt: Date;
  readonly type: string;
  readonly payload: unknown;
  readonly nodeUrl: string | null;
  status: StoredEventStatus;
  constructor({
    _id,
    createdAt = new Date(),
    type,
    payload,
    nodeUrl,
    status,
  }: StoredEventInit) {
    super({ _id });
    this.createdAt = createdAt;
    this.type = type;
    this.payload = payload;
    this.nodeUrl = nodeUrl ?? null;
    this.status = status;
  }

  static fromDocument(document: StoredEventInit) {
    const storedEvent = new StoredEvent(document);
    return storedEvent;
  }
}
