import { Type } from "@sinclair/typebox";
import { CreateEntryRequest } from "./create-entry-request";

export const UpdateEntryRequest = Type.Partial(CreateEntryRequest, {
  $id: "UpdateEntryRequest",
  description: "Partial update of an entry",
});

export type UpdateEntryRequest = typeof UpdateEntryRequest;
