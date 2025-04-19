import { Static, Type } from "@sinclair/typebox";
import { PeerNode, PeerNodeInit } from "~/synchronization/entities/peer-node";

export const UpdatePeerNodeRequest = Type.Object(
  {
    trustLevel: Type.Enum(PeerNode.TrustLevel),
  },
  {
    $id: "UpdatePeerNodeRequest",
  }
) satisfies {
  static: Partial<PeerNodeInit>;
};

export type UpdatePeerNodeRequest = Static<typeof UpdatePeerNodeRequest>;
