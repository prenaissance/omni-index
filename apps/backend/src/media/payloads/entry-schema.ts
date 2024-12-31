import { Type } from "@sinclair/typebox";

import { ObjectId } from "mongodb";
import { Entry } from "../entities/entry";
import { MediaSchema } from "./media-schema";
import { BlobLinkSchema } from "./blob-link-schema";
import { MetadataSchema } from "~/common/payloads/metadata";

export const EntrySchema = Type.Object(
  {
    _id: Type.Unsafe<ObjectId>({
      type: "string",
      description: "ObjectId of the media entry",
    }),
    title: Type.String(),
    author: Type.String(),
    localizedTitle: Type.Optional(Type.String()),
    slug: Type.String(),
    year: Type.Optional(Type.Number()),
    language: Type.Optional(Type.String()),
    thumbnail: Type.Optional(BlobLinkSchema),
    createdAt: Type.Unsafe<Date>(Type.String({ format: "date-time" })),
    updatedAt: Type.Unsafe<Date>(Type.String({ format: "date-time" })),
    meta: Type.Ref(MetadataSchema),
    media: Type.Array(Type.Ref(MediaSchema)),
    genres: Type.Array(Type.String()),
  },
  {
    $id: "Entry",
  }
) satisfies { static: Entry };
