import { Static, Type } from "@sinclair/typebox";
import { IndexSchema } from "../index/index-schema";
import { MetadataSchema } from "~/common/payloads/metadata-schema";
import { ObjectIdSchema } from "~/common/payloads/object-id-schema";
import { ClassProperties } from "~/common/utilities/serialization";
import { Media } from "~/media/entities";

export const MediaSchema = Type.Object(
  {
    _id: ObjectIdSchema({
      description: "ObjectId of the media",
    }),
    mirrors: Type.Array(Type.Ref(IndexSchema)),
    meta: Type.Ref(MetadataSchema),
  },
  {
    $id: "Media",
  }
) satisfies { static: ClassProperties<Media> };

export type MediaSchema = Static<typeof MediaSchema>;
