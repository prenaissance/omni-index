import { Type, Static } from "@sinclair/typebox";
import { DateSchema, MetadataSchema, ObjectIdSchema } from "~/common/payloads";
import { BlobLinkSchema } from "~/media/payloads/blob-link-schema";

export const IndexExportSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    provider: Type.Optional(
      Type.String({
        description: "The third party host of the media",
      })
    ),
    mimeType: Type.Optional(
      Type.String({
        description: "The media type",
      })
    ),
    size: Type.Optional(
      Type.Number({
        description: "Size of the media in bytes",
      })
    ),
    blob: Type.Ref(BlobLinkSchema),
    meta: Type.Ref(MetadataSchema),
  },
  { $id: "IndexExport" }
);
export type IndexExportSchema = Static<typeof IndexExportSchema>;

export const MediaExportSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    mirrors: Type.Array(Type.Ref(IndexExportSchema)),
    meta: Type.Ref(MetadataSchema),
  },
  {
    $id: "MediaExport",
  }
);
export type MediaExportSchema = Static<typeof MediaExportSchema>;

export const EntryExportSchema = Type.Object({
  _id: ObjectIdSchema(),
  title: Type.String(),
  localizedTitle: Type.Optional(Type.String()),
  year: Type.Optional(Type.Number()),
  language: Type.Optional(Type.String()),
  thumbnail: Type.Optional(BlobLinkSchema),
  createdAt: DateSchema(),
  updatedAt: DateSchema(),
  meta: Type.Ref(MetadataSchema),
  genres: Type.Array(Type.String()),
  media: Type.Array(Type.Ref(MediaExportSchema)),
});
export type EntryExportSchema = Static<typeof EntryExportSchema>;
