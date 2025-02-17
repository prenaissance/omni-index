import { AtprotoDid } from "@atproto/oauth-client-node";

export type CommentDislikedEvent = {
  commentTid: string;
  createdByDid: AtprotoDid;
};
