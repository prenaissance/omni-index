import { Type } from "@sinclair/typebox";
import { BlobLink } from "../entities/entry";

export const HotLinkUrlSchema = Type.Object(
  {
    url: Type.String({
      format: "uri",
      description: "Hot URL",
    }),
  },
  {
    $id: "HotLinkUrlSchema",
  }
);
export const IPFSLinkSchema = Type.Object(
  {
    cid: Type.String({
      description: "IPFS CID",
    }),
    accessUrl: Type.String({
      format: "uri",
      description: "IPFS access URL",
    }),
  },
  {
    $id: "IPFSLinkSchema",
  }
);

export const BlobLinkSchema = Type.Union([HotLinkUrlSchema, IPFSLinkSchema], {
  $id: "BlobLinkSchema",
}) satisfies { static: BlobLink };
