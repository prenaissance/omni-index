import { AtprotoDid } from "@atproto/oauth-client-node";

export type CommentLikedEvent = {
  commentTid: string;
  createdByDid: AtprotoDid;
  createdAt: Date;
};
