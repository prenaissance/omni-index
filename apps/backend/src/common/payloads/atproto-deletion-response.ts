import { Type } from "@sinclair/typebox";

export const AtprotoDeletionResponse = Type.Object(
  {
    locallyDeleted: Type.Boolean(),
    atprotoDeleted: Type.Boolean(),
  },
  {
    $id: "AtprotoDeletionResponse",
  }
);
