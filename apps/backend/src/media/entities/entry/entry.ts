import crypto from "node:crypto";
import { Db, WithId } from "mongodb";
import { BlobLink } from "./blob-link";
import { Media } from "./media";

export const ENTRY_COLLECTION = "entries";

export type Entry = {
  title: string;
  localizedTitle?: string;
  slug: string;
  year?: number;
  language?: string;
  description?: string;
  thumbnail?: BlobLink;
  /** UTC timestamp */
  createdAt: Date;
  /** UTC timestamp */
  updatedAt: Date;
  meta: Record<string, unknown>;
  media: Media[];
};

export const calculateSlug = (
  entry: Pick<Entry, "title" | "year" | "language" | "meta">
) => {
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
};
export type EntryWithId = WithId<Entry>;

export const Entry = {
  getCollection: (db: Db) => db.collection<Entry>(ENTRY_COLLECTION),
};
