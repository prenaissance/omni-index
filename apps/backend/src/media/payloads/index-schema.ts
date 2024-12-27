import { Type } from "@sinclair/typebox";
import { Index } from "../entities/entry";
import { BlobLinkSchema } from "./blob-link-schema";

export const IndexSchema = Type.Object(
  {
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
  },
  { $id: "IndexSchema" }
) satisfies { static: Index };
