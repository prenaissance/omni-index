import { Static, Type } from "@sinclair/typebox";
import { UserRole } from "~/common/auth/entities/enums/user-role";

export const ProfileResponse = Type.Object(
  {
    did: Type.String(),
    role: Type.Enum(UserRole),
    handle: Type.Optional(Type.String()),
    displayName: Type.Optional(Type.String()),
    description: Type.Optional(Type.String()),
    avatarUrl: Type.Optional(Type.String({ format: "uri" })),
  },
  {
    $id: "ProfileResponse",
  }
);

export type ProfileResponse = Static<typeof ProfileResponse>;
