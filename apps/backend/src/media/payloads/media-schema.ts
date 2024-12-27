import { Type } from "@sinclair/typebox";
import { Media } from "../entities/entry";
import { IndexSchema } from "./index-schema";

export const MediaSchema = Type.Object(
  {
    mirrors: Type.Array(Type.Ref(IndexSchema)),
    meta: Type.Object({}, { additionalProperties: true }),
  },
  {
    $id: "MediaSchema",
  }
) satisfies { static: Media };
