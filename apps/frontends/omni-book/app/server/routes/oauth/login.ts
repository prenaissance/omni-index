import { redirect } from "react-router";
import type { Route } from "./+types/login";
import { env } from "~/server/env";

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const handle = formData.get("handle") as string;
  const response = await fetch(`${env.API_URL}/api/oauth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "manual",
    body: JSON.stringify({ handle }),
  });
  return redirect(response.headers.get("Location")!);
};
