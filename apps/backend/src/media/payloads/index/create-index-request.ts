import { Static, Type } from "@sinclair/typebox";
import { BlobLinkSchema } from "../blob-link-schema";
import { IndexInit } from "~/media/entities";
import { MetadataSchema } from "~/common/payloads/metadata-schema";

export const CreateIndexRequest = Type.Object(
  {
    provider: Type.Optional(Type.String()),
    mimeType: Type.Optional(Type.String()),
    size: Type.Optional(Type.Number()),
    blob: Type.Ref(BlobLinkSchema),
    meta: Type.Ref(MetadataSchema),
  },
  {
    $id: "CreateIndexRequest",
  }
) satisfies { static: IndexInit };

export type CreateIndexRequest = Static<typeof CreateIndexRequest>;
