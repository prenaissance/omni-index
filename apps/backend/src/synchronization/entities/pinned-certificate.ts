import { Entity, EntityInit } from "~/common/entities/entity";

type PinnedCertificateInit = EntityInit & {
  createdAt?: Date;
  sha256: string;
};

export class PinnedCertificate extends Entity {
  createdAt: Date;
  sha256: string;

  constructor({ _id, sha256, createdAt }: PinnedCertificateInit) {
    super({ _id });
    this.createdAt = createdAt ?? new Date();
    this.sha256 = sha256;
  }
}
