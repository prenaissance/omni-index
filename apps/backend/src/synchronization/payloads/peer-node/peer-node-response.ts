import { Type } from "@sinclair/typebox";
import { DateSchema } from "~/common/payloads/date-schema";
import { ObjectIdSchema } from "~/common/payloads/object-id-schema";
import { ClassProperties } from "~/common/utilities/serialization";
import { PeerNode } from "~/synchronization/entities/peer-node";

export const PeerNodeResponse = Type.Object(
  {
    _id: ObjectIdSchema(),
    createdAt: DateSchema(),
    hostname: Type.String(),
    trustLevel: Type.Enum(PeerNode.TrustLevel),
    pinnedCertificates: Type.Array(
      Type.Object({
        _id: ObjectIdSchema(),
        createdAt: DateSchema(),
        sha256: Type.String(),
      })
    ),
  },
  {
    $id: "PeerNodeResponse",
  }
) satisfies {
  static: ClassProperties<PeerNode>;
};
