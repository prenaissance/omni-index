import { redirect } from "react-router";
import type { Route } from "./+types/logout";
import { env } from "~/server/env";
import { checkCookie } from "~/server/utils";

export const action = async ({ request }: Route.ActionArgs) => {
  const cookieHeader = checkCookie(request);

  const response = await fetch(`${env.API_URL}/api/oauth/logout`, {
    method: "POST",
    headers: {
      cookie: cookieHeader,
    },
  });

  if (!response.ok) {
    return redirect(`/?error=Error logging out`);
  }

  return redirect(`/?success=Logged out successfully`);
};
