import { Type } from "@sinclair/typebox";
import { BlobLinkSchema } from "../blob-link-schema";
import { Index } from "~/media/entities";
import { MetadataSchema } from "~/common/payloads/metadata-schema";
import { ObjectIdSchema } from "~/common/payloads/object-id-schema";
import { ClassProperties } from "~/common/utilities/serialization";

export const IndexSchema = Type.Object(
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
  { $id: "Index" }
) satisfies { static: ClassProperties<Index> };
