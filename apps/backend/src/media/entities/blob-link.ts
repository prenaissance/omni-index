export type HotLinkUrl = {
  url: string;
};

export type IPFSLink = {
  cid: string;
  accessUrl: string;
};

export type BlobLink = HotLinkUrl | IPFSLink;

export const isHotLinkUrl = (value: unknown): value is HotLinkUrl =>
  typeof value === "object" &&
  value !== null &&
  "url" in value &&
  typeof value.url === "string";
