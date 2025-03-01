/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { LexiconDoc, Lexicons } from "@atproto/lexicon";

export const schemaDict = {
  "ComOmni-indexComment": {
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
              maxGraphemes: 1000,
              description: "The text of the comment",
            },
            entrySlug: {
              type: "string",
              description: "The slug of the entry the comment is left on",
            },
            createdAt: {
              type: "string",
              format: "datetime",
            },
          },
          required: ["text", "entrySlug", "createdAt"],
        },
      },
    },
  },
  "ComOmni-indexCommentLike": {
    lexicon: 1,
    id: "com.omni-index.comment.like",
    description: "Like to a user's comment",
    defs: {
      main: {
        type: "record",
        key: "tid",
        record: {
          type: "object",
          properties: {
            commentUri: {
              type: "string",
              format: "at-uri",
            },
            createdAt: {
              type: "string",
              format: "datetime",
            },
          },
          required: ["commentUri", "createdAt"],
        },
      },
    },
  },
} as const satisfies Record<string, LexiconDoc>;

export const schemas = Object.values(schemaDict);
export const lexicons: Lexicons = new Lexicons(schemas);
export const ids = {
  "ComOmni-indexComment": "com.omni-index.comment",
  "ComOmni-indexCommentLike": "com.omni-index.comment.like",
};
