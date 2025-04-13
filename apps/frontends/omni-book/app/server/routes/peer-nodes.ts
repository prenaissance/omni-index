import { redirect } from "react-router";
import { parseCookie } from "../utils";
import type { Route } from "./+types/peer-nodes";
import type { paths } from "~/lib/api-types";
import { env } from "~/server/env";

type NodeFail =
  paths["/api/peer-nodes"]["post"]["responses"]["400"]["content"]["application/json"];

export const action = async ({ request }: Route.LoaderArgs) => {
  const formData = await request.formData();
  const hostname = formData.get("hostname") as string;
  const trustLevel = formData.get("trustLevel") as "trusted" | "semi-trusted";

  console.log("hostname", hostname);
  console.log("trustLevel", trustLevel);

  if (!hostname) {
    throw new Response(JSON.stringify({ error: "No hostname provided" }), {
      status: 400,
    });
  }

  if (!trustLevel) {
    throw new Response(JSON.stringify({ error: "No trustLevel provided" }), {
      status: 400,
    });
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
    body: JSON.stringify({ hostname, trustLevel }),
  });

  if (!response.ok) {
    const error: NodeFail = await response.json();
    throw new Response(JSON.stringify(error), {
      status: 400,
    });
  }

  return redirect(`/admin/nodes-config`);
};
