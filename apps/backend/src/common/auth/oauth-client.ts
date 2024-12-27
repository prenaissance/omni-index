import { NodeOAuthClient } from "@atproto/oauth-client-node";
import type { Db } from "mongodb";
import { MongoSessionStore, MongoStateStore } from "./storage";
import { env } from "~/env";

export const createOAuthClient = async (db: Db) => {
  const publicUrl = env.PUBLIC_URL;
  const url = publicUrl || `http://127.0.0.1:${env.PORT}`;

  return new NodeOAuthClient({
    clientMetadata: {
      client_name: "Omni-Index",
      client_id: publicUrl
        ? `${url}/client-metadata.json`
        : `http://localhost?redirect_uri=${encodeURIComponent(`${url}/api/oauth/callback`)}&scope=${encodeURIComponent("atproto transition:generic")}`,
      client_uri: url,
      redirect_uris: [`${url}/api/oauth/callback`],
      scope: "atproto transition:generic",
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      application_type: "web",
      token_endpoint_auth_method: "none",
      dpop_bound_access_tokens: true,
    },
    stateStore: new MongoStateStore(db),
    sessionStore: new MongoSessionStore(db),
  });
};
