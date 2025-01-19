import { Type } from "@sinclair/typebox";
import { PeerNodeResponse } from "./peer-node-response";

export const PeerNodeListResponse = Type.Array(Type.Ref(PeerNodeResponse), {
  $id: "PeerNodeListResponse",
});
