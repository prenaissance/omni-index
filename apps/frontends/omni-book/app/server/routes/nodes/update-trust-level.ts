import { redirect } from "react-router";
import { checkCookie } from "../../utils";
import type { Route } from "./+types/refresh-node-cert";
import type { components, paths } from "~/lib/api-types";
import { env } from "~/server/env";
import { validateFormData } from "~/lib/utils";

type NodeFail =
  paths["/api/peer-nodes/{id}"]["patch"]["responses"]["404"]["content"]["application/json"];

type UpdatePeerNode = components["schemas"]["UpdatePeerNodeRequest"];

export const action = async ({ request, params }: Route.LoaderArgs) => {
  const nodeId = params.nodeId;
  const formData = await request.formData();
  const trustLevel = formData.get("trustLevel") as UpdatePeerNode["trustLevel"];

  if (!trustLevel) {
    throw new Response("Trust level is required", { status: 400 });
  }

  const isHtmlRequest = request.headers.get("accept")?.includes("text/html");

  if (!nodeId) {
    throw new Response("Node ID is required", { status: 400 });
  }

  const cookieHeader = checkCookie(request);

  const response = await fetch(`${env.API_URL}/api/peer-nodes/${nodeId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      cookie: cookieHeader,
    },
    body: JSON.stringify({ trustLevel }),
  });

  if (!response.ok) {
    const error: NodeFail = await response.json();
    return validateFormData(
      error.message || "Error updating node trust level",
      isHtmlRequest
    );
  }

  if (isHtmlRequest) {
    return redirect(`/admin/nodes-config?success=Node trust level updated`);
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
