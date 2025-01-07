import { BlobLink } from "./blob-link";
import { Entity, EntityInit } from "~/common/entities/entity";
import { CreateMediaRequest } from "~/media/payloads/media/create-media-request";
import { Metadata } from "~/common/entities/metadata";
import { ClassProperties } from "~/common/utilities/serialization";
import { omit } from "~/common/utilities/functional";

export type IndexInit = {
  provider?: string;
  mimeType?: string;
  size?: number;
  blob: BlobLink;
  meta: Metadata;
} & EntityInit;

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

  constructor({ _id, provider, mimeType, size, blob, meta }: IndexInit) {
    super({ _id });
    this.provider = provider;
    this.mimeType = mimeType;
    this.size = size;
    this.blob = blob;
    this.meta = meta;
  }

  static fromDocument(document: IndexInit) {
    const index = new Index(document);
    return index;
  }

  equals(other: Index) {
    return (
      this.provider === other.provider &&
      this.mimeType === other.mimeType &&
      this.size === other.size &&
      JSON.stringify(this.blob) === JSON.stringify(other.blob) &&
      JSON.stringify(this.meta) === JSON.stringify(other.meta)
    );
  }
}

export type MediaInit = {
  mirrors: Index[];
  meta: Record<string, unknown>;
} & EntityInit;

export class Media extends Entity {
  mirrors: Index[];
  meta: Record<string, unknown>;

  constructor({ _id, mirrors, meta }: MediaInit) {
    super({ _id });
    this.mirrors = mirrors;
    this.meta = meta;
  }

  static fromDocument(document: CreateMediaRequest) {
    const mirrors = document.mirrors.map((mirror) =>
      Index.fromDocument(mirror)
    );
    const media = new Media({
      ...omit(document, ["mirrors"]),
      mirrors,
    });
    return media;
  }

  equals(other: Media) {
    return (
      this.mirrors.length === other.mirrors.length &&
      this.mirrors.every((mirror, index) =>
        mirror.equals(other.mirrors[index])
      ) &&
      JSON.stringify(this.meta) === JSON.stringify(other.meta)
    );
  }

  diff(other: Media) {
    const diff: Partial<Omit<ClassProperties<Media>, "mirrors">> = {};

    if (JSON.stringify(this.meta) !== JSON.stringify(other.meta)) {
      diff.meta = this.meta;
    }

    return diff;
  }
}
