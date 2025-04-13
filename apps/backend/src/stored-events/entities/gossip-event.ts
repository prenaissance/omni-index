import { ObjectId } from "mongodb";

export type GossipEvent<TKey extends string = string, TPayload = unknown> = {
  id: ObjectId | string;
  type: TKey;
  payload: TPayload;
};

export const isGossipEvent = (event: unknown): event is GossipEvent => {
  if (typeof event !== "object" || event === null) {
    return false;
  }

  const { id, type, payload } = event as Partial<GossipEvent>;

  return (
    (id instanceof ObjectId || typeof id === "string") &&
    typeof type === "string" &&
    (typeof payload === "object" || payload === undefined)
  );
};
