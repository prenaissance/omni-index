import {
  NodeOAuthClient,
  NodeSavedSessionStore,
  NodeSavedStateStore,
} from "@atproto/oauth-client-node";
import { Env } from "../config/env";

export const createOAuthClient = async (
  sessionStore: NodeSavedSessionStore,
  stateStore: NodeSavedStateStore,
  env: Env
) => {
  const url = env.FRONTEND_URL;

  return new NodeOAuthClient({
    clientMetadata: {
      client_name: "Omni-Index",
      client_id:
        env.NODE_ENV === "production"
          ? `${url}/client-metadata.json`
          : `http://localhost?redirect_uri=${encodeURIComponent(
              env.CALLBACK_URL
            )}&scope=${encodeURIComponent("atproto transition:generic")}`,
      client_uri: url,
      redirect_uris: [env.CALLBACK_URL],
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
