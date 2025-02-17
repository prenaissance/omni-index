/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  "/client-metadata.json": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Default Response */
        200: {
          headers: Record<string, unknown>;
          content?: never;
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/auth/token": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            token: string;
          };
        };
      };
      responses: {
        /** @description Default Response */
        200: {
          headers: Record<string, unknown>;
          content: {
            "application/json": components["schemas"]["TokenPair"];
          };
        };
        /** @description Default Response */
        400: {
          headers: Record<string, unknown>;
          content: {
            "application/json": components["schemas"]["Exception"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/auth/refresh": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            refreshToken: string;
          };
        };
      };
      responses: {
        /** @description Default Response */
        200: {
          headers: Record<string, unknown>;
          content: {
            "application/json": components["schemas"]["TokenPair"];
          };
        };
        /** @description Default Response */
        400: {
          headers: Record<string, unknown>;
          content: {
            "application/json": components["schemas"]["Exception"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/entries": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: {
          /** @description Page number (1 indexed) */
          page?: number;
          /** @description Page size */
          limit?: number;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Default Response */
        200: {
          headers: Record<string, unknown>;
          content: {
            "application/json": {
              data: components["schemas"]["Entry"][];
              meta: {
                /** @description Total number of items matching the query */
                total: number;
                /** @description Current page number (1 indexed) */
                page: number;
                /** @description Number of items per page */
                limit: number;
              };
            };
          };
        };
      };
    };
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          "application/json": components["schemas"]["CreateEntryRequest"];
        };
      };
      responses: {
        /** @description Default Response */
        201: {
          headers: Record<string, unknown>;
          content: {
            "application/json": components["schemas"]["Entry"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/entries/{id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /** @description ObjectId of the media entry */
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Default Response */
        200: {
          headers: Record<string, unknown>;
          content: {
            "application/json": components["schemas"]["Entry"];
          };
        };
        /** @description Default Response */
        404: {
          headers: Record<string, unknown>;
          content: {
            "application/json": components["schemas"]["Exception"];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/entries/{entryId}/media": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /**
           * @description ObjectId of the media entry
           * @example 5fdedb7c25ab1352eef88f60
           */
          entryId: string;
        };
        cookie?: never;
      };
      requestBody?: {
        content: {
          "application/json": components["schemas"]["CreateMediaRequest"][];
        };
      };
      responses: {
        /** @description Default Response */
        201: {
          headers: Record<string, unknown>;
          content: {
            "application/json": components["schemas"]["Entry"];
          };
        };
        /** @description Default Response */
        404: {
          headers: Record<string, unknown>;
          content: {
            "application/json": components["schemas"]["Exception"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/entries/{entryId}/media/{mediaId}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /**
           * @description ObjectId of the media entry
           * @example 5fdedb7c25ab1352eef88f60
           */
          entryId: string;
          /**
           * @description ObjectId of the media
           * @example 5fdedb7c25ab1352eef88f60
           */
          mediaId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Default Response */
        200: {
          headers: Record<string, unknown>;
          content: {
            "application/json": components["schemas"]["Entry"];
          };
        };
        /** @description Default Response */
        404: {
          headers: Record<string, unknown>;
          content: {
            "application/json": components["schemas"]["Exception"];
          };
        };
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/entries/{entryId}/media/{mediaId}/mirrors": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /**
           * @description ObjectId of the media entry
           * @example 5fdedb7c25ab1352eef88f60
           */
          entryId: string;
          /**
           * @description ObjectId of the media under the entry
           * @example 5fdedb7c25ab1352eef88f60
           */
          mediaId: string;
        };
        cookie?: never;
      };
      requestBody?: {
        content: {
          "application/json": components["schemas"]["CreateIndexRequest"][];
        };
      };
      responses: {
        /** @description Default Response */
        201: {
          headers: Record<string, unknown>;
          content: {
            "application/json": components["schemas"]["Entry"];
          };
        };
        /** @description Default Response */
        404: {
          headers: Record<string, unknown>;
          content: {
            "application/json": components["schemas"]["Exception"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/entries/{entryId}/media/{mediaId}/mirrors/{mirrorId}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /**
           * @description ObjectId of the media entry
           * @example 5fdedb7c25ab1352eef88f60
           */
          entryId: string;
          /**
           * @description ObjectId of the media under the entry
           * @example 5fdedb7c25ab1352eef88f60
           */
          mediaId: string;
          /**
           * @description ObjectId of the mirror to delete
           * @example 5fdedb7c25ab1352eef88f60
           */
          mirrorId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Default Response */
        200: {
          headers: Record<string, unknown>;
          content: {
            "application/json": components["schemas"]["Entry"];
          };
        };
        /** @description Default Response */
        404: {
          headers: Record<string, unknown>;
          content: {
            "application/json": components["schemas"]["Exception"];
          };
        };
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/events": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: {
          /** @description Page number (1 indexed) */
          page?: number;
          /** @description Page size */
          limit?: number;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Default Response */
        200: {
          headers: Record<string, unknown>;
          content: {
            "application/json": components["schemas"]["StoredEventResponse"][];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/oauth/login": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          "application/json": components["schemas"]["LoginRequestSchema"];
        };
      };
      responses: {
        /** @description Default Response */
        302: {
          headers: Record<string, unknown>;
          content?: never;
        };
        /** @description Default Response */
        404: {
          headers: Record<string, unknown>;
          content: {
            "application/json": {
              message: string;
            };
          };
        };
        /** @description Default Response */
        422: {
          headers: Record<string, unknown>;
          content: {
            "application/json": {
              message: string;
            };
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/oauth/callback": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Default Response */
        200: {
          headers: Record<string, unknown>;
          content?: never;
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/peer-nodes": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Retrieves all peer nodes */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Default Response */
        200: {
          headers: Record<string, unknown>;
          content: {
            "application/json": components["schemas"]["PeerNodeListResponse"];
          };
        };
      };
    };
    put?: never;
    /**
     * Creates a new peer node
     * @description Creates a new peer node with the specified hostname and trust level
     */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          "application/json": components["schemas"]["CreatePeerNodeRequest"];
        };
      };
      responses: {
        /** @description Default Response */
        201: {
          headers: Record<string, unknown>;
          content: {
            "application/json": components["schemas"]["PeerNodeResponse"];
          };
        };
        /** @description Default Response */
        400: {
          headers: Record<string, unknown>;
          content: {
            "application/json": components["schemas"]["Exception"];
          };
        };
        /** @description Default Response */
        409: {
          headers: Record<string, unknown>;
          content: {
            "application/json": components["schemas"]["Exception"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/peer-nodes/{id}/refresh": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Refreshes the pinned certificate for a peer node */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /**
           * @description ObjectId of the peer node
           * @example 5fdedb7c25ab1352eef88f60
           */
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Default Response */
        200: {
          headers: Record<string, unknown>;
          content: {
            "application/json": components["schemas"]["PeerNodeResponse"];
          };
        };
        /** @description Default Response */
        404: {
          headers: Record<string, unknown>;
          content: {
            "application/json": components["schemas"]["Exception"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/peer-nodes/{id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    /** Deletes a peer node */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /**
           * @description ObjectId of the peer node
           * @example 5fdedb7c25ab1352eef88f60
           */
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Default Response */
        204: {
          headers: Record<string, unknown>;
          content?: never;
        };
        /** @description Default Response */
        404: {
          headers: Record<string, unknown>;
          content: {
            "application/json": components["schemas"]["Exception"];
          };
        };
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/shallow-ping": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Default Response */
        200: {
          headers: Record<string, unknown>;
          content?: never;
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    /**
     * Metadata
     * @description Arbitrary metadata
     * @default {}
     */
    Metadata: Record<string, unknown>;
    /** Exception */
    Exception: {
      /** @description Exception message */
      message: string;
      data?: unknown;
    };
    /** PaginationQuery */
    PaginationQuery: {
      /**
       * @description Page number (1 indexed)
       * @default 1
       */
      page: number;
      /**
       * @description Page size
       * @default 10
       */
      limit: number;
    };
    /** BlobLink */
    BlobLink:
      | {
          /**
           * Format: uri
           * @description Hot URL
           */
          url: string;
        }
      | {
          /** @description IPFS CID */
          cid: string;
          /**
           * Format: uri
           * @description IPFS access URL
           */
          accessUrl: string;
        };
    /** HotLinkUrl */
    HotLinkUrl: {
      /**
       * Format: uri
       * @description Hot URL
       */
      url: string;
    };
    /** IPFSLink */
    IPFSLink: {
      /** @description IPFS CID */
      cid: string;
      /**
       * Format: uri
       * @description IPFS access URL
       */
      accessUrl: string;
    };
    /** Index */
    Index: {
      /**
       * @description ObjectId
       * @example 5fdedb7c25ab1352eef88f60
       */
      _id: string;
      /** @description The third party host of the media */
      provider?: string;
      /** @description The media type */
      mimeType?: string;
      /** @description Size of the media in bytes */
      size?: number;
      blob: components["schemas"]["BlobLink"];
      meta: components["schemas"]["Metadata"];
    };
    /** Media */
    Media: {
      /**
       * @description ObjectId of the media
       * @example 5fdedb7c25ab1352eef88f60
       */
      _id: string;
      mirrors: components["schemas"]["Index"][];
      meta: components["schemas"]["Metadata"];
    };
    /** Entry */
    Entry: {
      /**
       * @description ObjectId of the media entry
       * @example 5fdedb7c25ab1352eef88f60
       */
      _id: string;
      title: string;
      author: string;
      localizedTitle?: string;
      slug: string;
      year?: number;
      language?: string;
      thumbnail?:
        | {
            /**
             * Format: uri
             * @description Hot URL
             */
            url: string;
          }
        | {
            /** @description IPFS CID */
            cid: string;
            /**
             * Format: uri
             * @description IPFS access URL
             */
            accessUrl: string;
          };
      /** Format: date-time */
      createdAt: string;
      /** Format: date-time */
      updatedAt: string;
      meta: components["schemas"]["Metadata"];
      media: components["schemas"]["Media"][];
      genres: string[];
    };
    /** CreateIndexRequest */
    CreateIndexRequest: {
      provider?: string;
      mimeType?: string;
      size?: number;
      blob: components["schemas"]["BlobLink"];
      meta: components["schemas"]["Metadata"];
    };
    /** CreateMediaRequest */
    CreateMediaRequest: {
      meta: components["schemas"]["Metadata"];
    } & {
      mirrors: components["schemas"]["CreateIndexRequest"][];
    };
    /** CreateEntryRequest */
    CreateEntryRequest: {
      title: string;
      author: string;
      localizedTitle?: string;
      year?: number;
      language?: string;
      thumbnail?:
        | {
            /**
             * Format: uri
             * @description Hot URL
             */
            url: string;
          }
        | {
            /** @description IPFS CID */
            cid: string;
            /**
             * Format: uri
             * @description IPFS access URL
             */
            accessUrl: string;
          };
      meta: components["schemas"]["Metadata"];
      genres: string[];
    } & {
      media: ({
        meta: components["schemas"]["Metadata"];
      } & {
        mirrors: components["schemas"]["CreateIndexRequest"][];
      })[];
    };
    /** TokenPair */
    TokenPair: {
      /** @description JWT access token */
      accessToken: string;
      /** @description JWT refresh token. Use on POST /api/auth/refresh to get a new token pair. */
      refreshToken: string;
    };
    /** StoredEventResponse */
    StoredEventResponse: {
      /**
       * @description ObjectId
       * @example 5fdedb7c25ab1352eef88f60
       */
      _id: string;
      /** Format: date-time */
      createdAt: string;
      /** @description TODO: Constraint to possible events enum */
      type: string;
      payload: unknown;
    };
    /** LoginRequestSchema */
    LoginRequestSchema: {
      /** @description User handle. Example: @example.bsky.social */
      handle: string;
    };
    /** LoginResponseSchema */
    LoginResponseSchema: {
      /** @description JWT token */
      token: string;
    };
    /** CreatePeerNodeRequest */
    CreatePeerNodeRequest: {
      hostname: string;
      trustLevel: "trusted" | "semi-trusted";
    };
    /** PeerNodeResponse */
    PeerNodeResponse: {
      /**
       * @description ObjectId
       * @example 5fdedb7c25ab1352eef88f60
       */
      _id: string;
      /** Format: date-time */
      createdAt: string;
      hostname: string;
      pinnedCertificates: {
        /**
         * @description ObjectId
         * @example 5fdedb7c25ab1352eef88f60
         */
        _id: string;
        /** Format: date-time */
        createdAt: string;
        sha256: string;
      }[];
    };
    /** PeerNodeListResponse */
    PeerNodeListResponse: components["schemas"]["PeerNodeResponse"][];
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
