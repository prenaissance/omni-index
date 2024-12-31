import { Static, Type } from "@sinclair/typebox";
import { WithoutId } from "mongodb";
import { Index } from "../entities/entry";
import { BlobLinkSchema } from "./blob-link-schema";
import { MetadataSchema } from "~/common/payloads/metadata";

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
) satisfies { static: WithoutId<Index> };

export type CreateIndexRequest = Static<typeof CreateIndexRequest>;
