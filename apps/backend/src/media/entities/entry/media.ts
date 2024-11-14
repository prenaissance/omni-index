export type Index = {
  /**
   * The third party host of the media
   */
  provider?: string;
  /**
   * The media type
   */
  mimeType?: string;
  /**
   * Size of the media in bytes
   */
  size?: number;
  url: string;
};

export type Media = {
  mirrors: Index[];
  meta: Record<string, unknown>;
};
