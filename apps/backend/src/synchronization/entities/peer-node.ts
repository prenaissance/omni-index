import { PinnedCertificate } from "./pinned-certificate";
import { DocumentLike } from "~/common/utilities/serialization";
import { Entity, EntityInit } from "~/common/entities/entity";
import { omit } from "~/common/utilities/functional";

export enum NodeTrustLevel {
  Trusted = "trusted",
  SemiTrusted = "semi-trusted",
}

export type PeerNodeInit = EntityInit & {
  createdAt?: Date;
  url: string;
  trustLevel: NodeTrustLevel;
  pinnedCertificates?: PinnedCertificate[];
};

export class PeerNode extends Entity {
  createdAt: Date;
  url: string;
  trustLevel: NodeTrustLevel;
  pinnedCertificates: PinnedCertificate[];

  constructor({
    _id,
    createdAt,
    url,
    trustLevel,
    pinnedCertificates,
  }: PeerNodeInit) {
    super({ _id });
    this.createdAt = createdAt ?? new Date();
    this.url = url;
    this.trustLevel = trustLevel;
    this.pinnedCertificates = pinnedCertificates ?? [];
  }

  static readonly TrustLevel = NodeTrustLevel;

  static fromDocument(document: DocumentLike<PeerNode>) {
    const pinnedCertificates = document.pinnedCertificates.map(
      (pinnedCertificate) => new PinnedCertificate(pinnedCertificate)
    );

    return new PeerNode({
      ...omit(document, ["pinnedCertificates"]),
      pinnedCertificates,
    });
  }
}
