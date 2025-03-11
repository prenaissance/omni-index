import { Type, Static } from "@sinclair/typebox";
import { DateSchema, MetadataSchema, ObjectIdSchema } from "~/common/payloads";
import { ClassProperties } from "~/common/utilities/serialization";
import { Entry } from "~/media/entities";
import { BlobLinkSchema } from "~/media/payloads/blob-link-schema";
import { IndexSchema } from "~/media/payloads/index/index-schema";
import { MediaSchema } from "~/media/payloads/media/media-schema";

export const EntryUpdatedEvent = Type.Object(
  {
    type: Type.Literal("entry.updated"),
    entryId: ObjectIdSchema(),
    fields: Type.Partial(
      Type.Object({
        title: Type.String(),
        author: Type.String(),
        genres: Type.Array(Type.String()),
        localizedTitle: Type.Optional(Type.String()),
        thumbnail: Type.Ref(BlobLinkSchema),
        updatedAt: DateSchema(),
        meta: Type.Ref(MetadataSchema),
      })
    ) satisfies {
      static: Partial<
        Omit<ClassProperties<Entry>, "_id" | "createdAt" | "slug" | "media">
      >;
    },
    deletedMediaIds: Type.Array(ObjectIdSchema()),
    createdMedia: Type.Array(Type.Ref(MediaSchema)),
    mediaUpdates: Type.Array(
      Type.Object({
        mediaId: ObjectIdSchema(),
        meta: Type.Optional(
          Type.Ref(MetadataSchema, { description: "Only spec" })
        ),
        createdMirrors: Type.Array(Type.Ref(IndexSchema)),
        deletedMirrorIds: Type.Array(ObjectIdSchema()),
      })
    ),
  },
  {
    $id: "EntryUpdatedEvent",
  }
);

export type EntryUpdatedEvent = Static<typeof EntryUpdatedEvent>;
