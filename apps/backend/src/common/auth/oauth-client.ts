import {
  NodeOAuthClient,
  NodeSavedSessionStore,
  NodeSavedStateStore,
} from "@atproto/oauth-client-node";
import { env } from "~/common/config/env";

export const createOAuthClient = async (
  sessionStore: NodeSavedSessionStore,
  stateStore: NodeSavedStateStore
) => {
  const publicUrl = env.NODE_ENV === "production" ? env.API_URL : undefined;
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
    stateStore,
    sessionStore,
  });
};
