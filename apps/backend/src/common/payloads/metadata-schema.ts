import { Type } from "@sinclair/typebox";
import { Metadata } from "../entities/metadata";

export const MetadataSchema = Type.Object(
  {},
  {
    additionalProperties: true,
    $id: "Metadata",
    description: "Arbitrary metadata",
    default: {},
  }
) satisfies { static: Metadata };
