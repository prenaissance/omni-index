/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from "@atproto/lexicon";
import { CID } from "multiformats/cid";
import { lexicons } from "../../../lexicons";
import { isObj, hasProp } from "../../../util";

export interface Record {
  /** The text of the comment */
  text: string;
  /** The ObjectId of the entry this comment refers to */
  entryId: string;
  createdAt: string;
  [k: string]: unknown;
}

export function isRecord(v: unknown): v is Record {
  return (
    isObj(v) &&
    hasProp(v, "$type") &&
    (v.$type === "com.omni-index.comment#main" ||
      v.$type === "com.omni-index.comment")
  );
}

export function validateRecord(v: unknown): ValidationResult {
  return lexicons.validate("com.omni-index.comment#main", v);
}
