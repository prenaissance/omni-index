import { WithoutId } from "mongodb";
import { BlobLink } from "./blob-link";
import { Entity, EntityInit } from "~/common/entities/entity";
import { CreateMediaRequest } from "~/media/payloads/create-media-request";
import { CreateIndexRequest } from "~/media/payloads/create-index-request";
import { Metadata } from "~/common/entities/metadata";

export class Index extends Entity {
  /**
   * The third party host of the media
   */
  provider?: string;
  /**
   * The media type
   */
  mimeType?: string;
  /**
   * Size of the media in bytes
   */
  size?: number;
  blob: BlobLink;
  meta: Metadata;

  constructor({
    _id,
    provider,
    mimeType,
    size,
    blob,
    meta,
  }: WithoutId<Index> & EntityInit) {
    super({ _id });
    this.provider = provider;
    this.mimeType = mimeType;
    this.size = size;
    this.blob = blob;
    this.meta = meta;
  }

  static fromDocument(document: CreateIndexRequest) {
    const index = new Index(document);
    return index;
  }
}

export class Media extends Entity {
  mirrors: Index[];
  meta: Record<string, unknown>;

  constructor({ _id, mirrors, meta }: WithoutId<Media> & EntityInit) {
    super({ _id });
    this.mirrors = mirrors;
    this.meta = meta;
  }

  static fromDocument(document: CreateMediaRequest) {
    const mirrors = document.mirrors.map((mirror) =>
      Index.fromDocument(mirror)
    );
    const media = new Media({
      mirrors,
      meta: document.meta,
    });
    return media;
  }
}
