import { Static, Type } from "@sinclair/typebox";
import { CreateIndexRequest } from "../index/create-index-request";
import { MediaSchema } from "./media-schema";

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
