import { Static, Type } from "@sinclair/typebox";

import { MediaSchema } from "../media/media-schema";
import { BlobLinkSchema } from "../blob-link-schema";
import { Entry } from "~/media/entities";
import { MetadataSchema } from "~/common/payloads/metadata-schema";
import { ObjectIdSchema } from "~/common/payloads/object-id-schema";
import { ClassProperties } from "~/common/utilities/serialization";
import { DateSchema } from "~/common/payloads/date-schema";

export const EntrySchema = Type.Object(
  {
    _id: ObjectIdSchema({
      description: "ObjectId of the media entry",
    }),
    title: Type.String(),
    description: Type.Optional(Type.String()),
    author: Type.String(),
    localizedTitle: Type.Optional(Type.String()),
    slug: Type.String(),
    year: Type.Optional(Type.Number()),
    language: Type.Optional(Type.String()),
    thumbnail: Type.Optional(BlobLinkSchema),
    createdAt: DateSchema(),
    updatedAt: DateSchema(),
    meta: Type.Ref(MetadataSchema),
    media: Type.Array(Type.Ref(MediaSchema)),
    genres: Type.Array(Type.String()),
  },
  {
    $id: "Entry",
  }
) satisfies { static: ClassProperties<Entry> };

export type EntrySchema = Static<typeof EntrySchema>;
