import { Entity, EntityInit } from "~/common/entities/entity";

export type StoredEventInit = {
  createdAt?: Date;
  type: string;
  payload: unknown;
  nodeUrl?: string | null;
} & EntityInit;

export class StoredEvent extends Entity {
  readonly createdAt: Date;
  readonly type: string;
  readonly payload: unknown;
  readonly nodeUrl: string | null;
  constructor({
    _id,
    createdAt = new Date(),
    type,
    payload,
    nodeUrl,
  }: StoredEventInit) {
    super({ _id });
    this.createdAt = createdAt;
    this.type = type;
    this.payload = payload;
    this.nodeUrl = nodeUrl ?? null;
  }

  static fromDocument(document: StoredEventInit) {
    const storedEvent = new StoredEvent(document);
    return storedEvent;
  }
}
