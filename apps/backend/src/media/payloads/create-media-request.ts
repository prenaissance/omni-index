import { Static, Type } from "@sinclair/typebox";
import { MediaSchema } from "./media-schema";
import { CreateIndexRequest } from "./create-index-request";

export const CreateMediaRequest = Type.Intersect(
  [
    Type.Omit(MediaSchema, ["_id", "mirrors"]),
    Type.Object({
      mirrors: Type.Array(Type.Ref(CreateIndexRequest)),
    }),
  ],
  {
    $id: "CreateMediaRequest",
  }
);

export type CreateMediaRequest = Static<typeof CreateMediaRequest>;
