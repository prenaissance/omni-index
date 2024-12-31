import { Type } from "@sinclair/typebox";
import { ObjectId } from "mongodb";
import { Media } from "../entities/entry";
import { IndexSchema } from "./index-schema";
import { MetadataSchema } from "~/common/payloads/metadata";

export const MediaSchema = Type.Object(
  {
    _id: Type.Unsafe<ObjectId>({
      description: "ObjectId of the media (as hex string)",
      type: "string",
    }),
    mirrors: Type.Array(Type.Ref(IndexSchema)),
    meta: Type.Ref(MetadataSchema),
  },
  {
    $id: "Media",
  }
) satisfies { static: Media };
