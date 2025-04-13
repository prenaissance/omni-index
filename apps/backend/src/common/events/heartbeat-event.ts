import { Static, Type } from "@sinclair/typebox";

export const HeartbeatEvent = Type.Object(
  {
    type: Type.Literal("heartbeat"),
  },
  {
    $id: "HeartbeatEvent",
  }
);
export type HeartbeatEvent = Static<typeof HeartbeatEvent>;
