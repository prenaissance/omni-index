import crypto from "node:crypto";
import { Db, WithoutId } from "mongodb";
import { EntryUpdatedEvent } from "../events/entry";
import { BlobLink } from "./blob-link";
import { Media } from "./media";
import { omit } from "~/common/utilities/functional";
import { Entity, EntityInit } from "~/common/entities/entity";
import { CreateEntryRequest } from "~/media/payloads/entry/create-entry-request";
import { ClassProperties } from "~/common/utilities/serialization";

export const ENTRY_COLLECTION = "entries";

export type EntryInit = EntityInit &
  Omit<
    WithoutId<ClassProperties<Entry>>,
    "slug" | "createdAt" | "updatedAt" | "media" | "genres"
  > &
  Pick<Partial<Entry>, "slug" | "createdAt" | "updatedAt" | "media" | "genres">;

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
    entry: Pick<Entry, "title" | "author" | "year" | "language" | "meta">
  ) {
    const base = entry.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const author = entry.author.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const year = entry.year ? `_${entry.year}` : "";
    const language =
      entry.language && !entry.language.includes("en")
        ? `_${entry.language}`
        : "";
    const meta = Object.keys(entry.meta).length
      ? `_${crypto.createHash("md5").update(JSON.stringify(entry.meta)).digest("hex").slice(6)}`
      : "";

    return `${base}_${author}${year}${language}${meta}`;
  }

  static getCollection(db: Db) {
    return db.collection<Entry>(ENTRY_COLLECTION);
  }

  constructor(props: EntryInit) {
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
    this.thumbnail = thumbnail ?? undefined;
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

  diff(other: Entry) {
    const fieldsDiff: Partial<Omit<ClassProperties<Entry>, "media">> = {};

    if (this.title !== other.title) fieldsDiff.title = this.title ?? null;

    if (this.author !== other.author) fieldsDiff.author = this.author;

    if (this.genres.length !== other.genres.length)
      fieldsDiff.genres = this.genres;

    if (this.genres.some((genre) => !other.genres.includes(genre)))
      fieldsDiff.genres = this.genres;

    if (this.localizedTitle !== other.localizedTitle)
      fieldsDiff.localizedTitle = this.localizedTitle;

    if (this.slug !== other.slug) fieldsDiff.slug = this.slug;

    if (this.year !== other.year) fieldsDiff.year = this.year;

    if (this.language !== other.language) fieldsDiff.language = this.language;

    if (this.description !== other.description)
      fieldsDiff.description = this.description;

    if (JSON.stringify(this.thumbnail) !== JSON.stringify(other.thumbnail))
      fieldsDiff.thumbnail = this.thumbnail;

    if (JSON.stringify(this.meta) !== JSON.stringify(other.meta))
      fieldsDiff.meta = this.meta;

    const existingMediaIds = new Set(this.media.map((m) => m._id.toString()));
    const newMediaIds = new Set(other.media.map((m) => m._id.toString()));
    const deletedMediaIds = existingMediaIds.difference(newMediaIds);
    const addedMediaIds = newMediaIds.difference(existingMediaIds);
    const remainingMediaIds = newMediaIds.intersection(existingMediaIds);

    const updatedMedia = other.media
      .filter((media) => remainingMediaIds.has(media._id.toString()))
      .filter((media) => {
        const existingMedia = this.media.find((m) => m._id.equals(media._id));
        return existingMedia && !media.equals(existingMedia);
      });

    const mediaUpdates: EntryUpdatedEvent["payload"]["mediaUpdates"] =
      updatedMedia.map((media) => {
        const existingMedia = this.media.find((m) => m._id.equals(media._id))!;
        const existingMirrors = new Set(
          existingMedia.mirrors.map((m) => m._id)
        );
        const newMirrors = new Set(media.mirrors.map((m) => m._id));
        const deletedMirrorIds = existingMirrors.difference(newMirrors);
        const createdMirrorIds = newMirrors.difference(existingMirrors);
        return {
          mediaId: media._id,
          meta: media.metaDiff(existingMedia),
          createdMirrors: media.mirrors.filter((m) =>
            createdMirrorIds.has(m._id)
          ),
          deletedMirrorIds: Array.from(deletedMirrorIds),
        };
      });

    const createdMedia = other.media.filter((m) =>
      addedMediaIds.has(m._id.toString())
    );

    return {
      fieldsDiff,
      deletedMediaIds: Array.from(deletedMediaIds),
      createdMedia,
      mediaUpdates,
    };
  }
}
