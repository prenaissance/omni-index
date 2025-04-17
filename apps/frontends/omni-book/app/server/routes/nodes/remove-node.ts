import { redirect } from "react-router";
import { checkCookie } from "../../utils";
import type { Route } from "./+types/remove-node";
import type { paths } from "~/lib/api-types";
import { env } from "~/server/env";

type NodeFail =
  paths["/api/peer-nodes/{id}"]["delete"]["responses"]["404"]["content"]["application/json"];

export const action = async ({ request, params }: Route.LoaderArgs) => {
  const nodeId = params.nodeId;
  if (!nodeId) {
    throw new Response("Node ID is required", { status: 400 });
  }

  const cookieHeader = checkCookie(request);

  const response = await fetch(`${env.API_URL}/api/peer-nodes/${nodeId}`, {
    method: "DELETE",
    headers: {
      cookie: cookieHeader,
    },
  });

  if (!response.ok) {
    const error: NodeFail = await response.json();
    return redirect(
      `/admin/nodes-config?error=${error.message || "Error removing node"}`
    );
  }

  return redirect(`/admin/nodes-config`);
};
