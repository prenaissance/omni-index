import { redirect } from "react-router";
import { checkCookie } from "../../utils";
import type { Route } from "./+types/refresh-node-cert";
import type { paths } from "~/lib/api-types";
import { env } from "~/server/env";

type NodeFail =
  paths["/api/peer-nodes/{id}/refresh"]["post"]["responses"]["404"]["content"]["application/json"];

export const action = async ({ request, params }: Route.LoaderArgs) => {
  const nodeId = params.nodeId;
  const isHtmlRequest = request.headers.get("accept")?.includes("text/html");

  if (!nodeId) {
    throw new Response("Node ID is required", { status: 400 });
  }

  const cookieHeader = checkCookie(request);

  const response = await fetch(
    `${env.API_URL}/api/peer-nodes/${nodeId}/refresh`,
    {
      method: "POST",
      headers: {
        cookie: cookieHeader,
      },
    }
  );

  if (!response.ok) {
    const error: NodeFail = await response.json();
    if (isHtmlRequest) {
      return redirect(
        `/admin/nodes-config?error=${error.message || "Error refreshing node certificate"}`
      );
    }

    return new Response(
      JSON.stringify({
        error: error.message || "Error refreshing node cert",
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  if (isHtmlRequest) {
    return redirect("/admin/nodes-config?success=Node certificate refreshed");
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
