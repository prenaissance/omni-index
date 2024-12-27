import { Type } from "@sinclair/typebox";
import { EntrySchema } from "./entry-schema";

export const CreateEntryRequest = Type.Omit(
  EntrySchema,
  ["_id", "createdAt", "updatedAt"],
  { $id: "CreateEntryRequest" }
);
