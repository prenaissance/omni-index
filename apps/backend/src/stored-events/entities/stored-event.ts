import { Entity, EntityInit } from "~/common/entities/entity";

export type StoredEventInit = {
  createdAt?: Date;
  type: string;
  payload: unknown;
} & EntityInit;

export class StoredEvent extends Entity {
  readonly createdAt: Date;
  readonly type: string;
  readonly payload: unknown;
  constructor({ _id, createdAt = new Date(), type, payload }: StoredEventInit) {
    super({ _id });
    this.createdAt = createdAt;
    this.type = type;
    this.payload = payload;
  }

  static fromDocument(document: StoredEventInit) {
    const storedEvent = new StoredEvent(document);
    return storedEvent;
  }
}
