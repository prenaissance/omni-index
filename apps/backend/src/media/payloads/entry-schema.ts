import { Type } from "@sinclair/typebox";

import { Entry } from "../entities/entry";
import { MediaSchema } from "./media-schema";
import { BlobLinkSchema } from "./blob-link-schema";

export const EntrySchema = Type.Object(
  {
    _id: Type.String({
      description: "ObjectId of the media entry",
    }),
    title: Type.String(),
    localizedTitle: Type.Optional(Type.String()),
    slug: Type.String(),
    year: Type.Optional(Type.Number()),
    language: Type.Optional(Type.String()),
    thumbnail: Type.Optional(BlobLinkSchema),
    createdAt: Type.Unsafe<Date>(Type.String({ format: "date-time" })),
    updatedAt: Type.Unsafe<Date>(Type.String({ format: "date-time" })),
    meta: Type.Object({}, { additionalProperties: true }),
    media: Type.Array(Type.Ref(MediaSchema)),
  },
  {
    $id: "EntrySchema",
  }
) satisfies { static: Entry };
