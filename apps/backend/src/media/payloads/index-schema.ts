import { Type } from "@sinclair/typebox";
import { ObjectId } from "mongodb";
import { Index } from "../entities/entry";
import { BlobLinkSchema } from "./blob-link-schema";
import { MetadataSchema } from "~/common/payloads/metadata";

export const IndexSchema = Type.Object(
  {
    _id: Type.Unsafe<ObjectId>({
      description: "ObjectId of the media index (as hex string)",
      type: "string",
    }),
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
) satisfies { static: Index };
