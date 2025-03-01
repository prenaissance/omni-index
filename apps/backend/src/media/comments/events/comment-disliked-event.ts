import { AtprotoDid } from "@atproto/oauth-client-node";

export type CommentLikeRemovedEvent = {
  commentTid: string;
  createdByDid: AtprotoDid;
};
