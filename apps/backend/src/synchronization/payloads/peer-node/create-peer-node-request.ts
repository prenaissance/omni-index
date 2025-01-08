import { Type } from "@sinclair/typebox";
import { PeerNode, PeerNodeInit } from "~/synchronization/entities/peer-node";

export const CreatePeerNodeRequest = Type.Object(
  {
    hostname: Type.String(),
    trustLevel: Type.Enum(PeerNode.TrustLevel),
  },
  {
    $id: "CreatePeerNodeRequest",
  }
) satisfies {
  static: Partial<PeerNodeInit>;
};
