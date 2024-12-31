import crypto from "node:crypto";
import { Db, WithoutId } from "mongodb";
import { BlobLink } from "./blob-link";
import { Media } from "./media";
import { omit } from "~/common/utilities/functional";
import { Entity, EntityInit } from "~/common/entities/entity";
import { CreateEntryRequest } from "~/media/payloads/create-entry-request";

export const ENTRY_COLLECTION = "entries";

export class Entry extends Entity {
  title: string;
  author: string;
  genres: string[];
  localizedTitle?: string;
  slug: string;
  year?: number;
  language?: string;
  description?: string;
  thumbnail?: BlobLink;
  /** UTC timestamp */
  readonly createdAt: Date;
  /** UTC timestamp */
  updatedAt: Date;
  meta: Record<string, unknown>;
  media: Media[];

  private static calculateSlug(
    entry: Pick<Entry, "title" | "year" | "language" | "meta">
  ) {
    const base = entry.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const year = entry.year ? `-${entry.year}` : "";
    const language =
      entry.language && !entry.language.includes("en")
        ? `-${entry.language}`
        : "";
    const meta = Object.keys(entry.meta).length
      ? `-${crypto.createHash("md5").update(JSON.stringify(entry.meta)).digest("hex").slice(6)}`
      : "";

    return `${base}${year}${language}${meta}`;
  }

  static getCollection(db: Db) {
    return db.collection<Entry>(ENTRY_COLLECTION);
  }

  constructor(
    props: Omit<
      WithoutId<Entry>,
      "slug" | "createdAt" | "updatedAt" | "media" | "genres"
    > &
      EntityInit &
      Pick<
        Partial<Entry>,
        "slug" | "createdAt" | "updatedAt" | "media" | "genres"
      >
  ) {
    const {
      _id,
      author,
      title,
      localizedTitle,
      year,
      language,
      description,
      thumbnail,
      createdAt = new Date(),
      updatedAt = new Date(),
      media = [],
      meta,
      genres = [],
    } = props;
    super({ _id });
    this.title = title;
    this.author = author;
    this.localizedTitle = localizedTitle;
    this.year = year;
    this.language = language;
    this.description = description;
    this.thumbnail = thumbnail;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.meta = meta;
    this.media = media;
    this.genres = genres;
    this.slug = Entry.calculateSlug(this);
  }

  static fromDocument(
    document: CreateEntryRequest &
      EntityInit & {
        createdAt?: Date;
        updatedAt?: Date;
      }
  ) {
    const media = document.media.map((media) => Media.fromDocument(media));
    const entry = new Entry({
      ...omit(document, ["media"]),
      media,
    });
    return entry;
  }
}
