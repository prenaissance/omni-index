import { Static, Type } from "@sinclair/typebox";
import { StoredEventStatus } from "../entities/stored-event";

export const ChangeStoredEventStatusRequest = Type.Object(
  {
    status: Type.Enum(StoredEventStatus),
  },
  {
    $id: "ChangeStoredEventStatusRequest",
  }
);

export type ChangeStoredEventStatusRequest = Static<
  typeof ChangeStoredEventStatusRequest
>;
