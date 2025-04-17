import type { Route } from "./+types/callback";
import { env } from "~/server/env";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { searchParams } = new URL(request.url);

  return await fetch(`${env.API_URL}/api/oauth/callback?${searchParams}`, {
    redirect: "manual",
  });
};
