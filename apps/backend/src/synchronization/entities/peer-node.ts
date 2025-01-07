import { Entity, EntityInit } from "~/common/entities/entity";

export enum NodeTrustLevel {
  Trusted = "trusted",
  SemiTrusted = "semi-trusted",
}

export type PeerNodeInit = EntityInit & {
  createdAt?: Date;
  hostname: string;
  trustLevel: NodeTrustLevel;
};

export class PeerNode extends Entity {
  createdAt: Date;
  hostname: string;
  trustLevel: NodeTrustLevel;

  constructor({ _id, createdAt, hostname, trustLevel }: PeerNodeInit) {
    super({ _id });
    this.createdAt = createdAt ?? new Date();
    this.hostname = hostname;
    this.trustLevel = trustLevel;
  }

  static readonly TrustLevel = NodeTrustLevel;
}
