/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { LexiconDoc, Lexicons } from "@atproto/lexicon";

export const schemaDict = {
  "ComOmni-indexComment": {
    $schema:
      "https://prenaissance.github.io/atproto-lexicon-json-schema/v1.json",
    lexicon: 1,
    id: "com.omni-index.comment",
    description: "Comment left by the user",
    defs: {
      main: {
        type: "record",
        key: "tid",
        record: {
          type: "object",
          properties: {
            text: {
              type: "string",
              maxLength: 3000,
              maxGraphemes: 300,
              description: "The text of the comment",
            },
            entryId: {
              type: "string",
              description: "The ObjectId of the entry this comment refers to",
            },
            createdAt: {
              type: "string",
              format: "datetime",
            },
          },
          required: ["text", "entryId", "createdAt"],
        },
      },
    },
  },
} as const satisfies Record<string, LexiconDoc>;

export const schemas = Object.values(schemaDict);
export const lexicons: Lexicons = new Lexicons(schemas);
export const ids = { "ComOmni-indexComment": "com.omni-index.comment" };
