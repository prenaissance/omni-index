import { redirect } from "react-router";
import { parseCookie } from "../utils";
import type { Route } from "./+types/peer-nodes";
import type { paths } from "~/lib/api-types";
import { env } from "~/server/env";

type NodeFail =
  paths["/api/peer-nodes"]["post"]["responses"]["400"]["content"]["application/json"];

export const action = async ({ request }: Route.LoaderArgs) => {
  const formData = await request.formData();
  const url = formData.get("url") as string;
  const trustLevel = formData.get("trustLevel") as "trusted" | "semi-trusted";

  if (!url) {
    return redirect("/admin/nodes-config?error=URL is required");
  }

  if (!trustLevel) {
    return redirect("/admin/nodes-config?error=Trust level is required");
  }

  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const parsedCookie = parseCookie(cookieHeader);
  if (!parsedCookie.session) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const response = await fetch(`${env.API_URL}/api/peer-nodes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: cookieHeader,
    },
    body: JSON.stringify({ url, trustLevel }),
  });

  if (!response.ok) {
    const error: NodeFail = await response.json();
    return redirect(
      `/admin/nodes-config?error=${error.message || "Error adding node"}`
    );
  }

  return redirect(`/admin/nodes-config?success=Node added successfully`);
};
