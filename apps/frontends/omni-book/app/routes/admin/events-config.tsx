import { redirect } from "react-router";
import type { Route } from "./+types/events-config";
import { checkCookie } from "~/server/utils";
import { env } from "~/lib/env";
import type { paths } from "~/lib/api-types";

type Profile =
  paths["/api/profile"]["get"]["responses"]["200"]["content"]["application/json"];

type EventsResponse =
  paths["/api/events"]["get"]["responses"]["200"]["content"]["application/json"];

type EventsQuery = NonNullable<
  paths["/api/events"]["get"]["parameters"]["query"]
>;

export const loader = async ({ request }: Route.LoaderArgs) => {
  const cookieHeader = checkCookie(request);

  const searchParams = new URL(request.url).searchParams;
  const page = Number.parseInt(searchParams.get("page") || "1");
  const limit = Number.parseInt(searchParams.get("limit") || "10");

  const res = await fetch(`${env.API_URL}/api/profile`, {
    method: "GET",
    credentials: "include",
    headers: {
      cookie: cookieHeader,
    },
  });

  if (!res.ok) {
    redirect("/");
  }

  const user = (await res.json()) as Profile;

  if (user.role !== "admin" && user.role !== "owner") {
    redirect("/");
  }

  const query: EventsQuery = {
    page,
    limit,
  };

  const querySearchParams = new URLSearchParams(
    Object.fromEntries(
      Object.entries(query)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ) as Record<string, string>
  );

  const targetUrl = `${env.API_URL}/api/events?${querySearchParams.toString()}`;

  const eventsResponse = await fetch(targetUrl, {
    method: "GET",
    credentials: "include",
    headers: {
      cookie: cookieHeader,
    },
  });

  if (!eventsResponse.ok) {
    redirect("/");
  }

  const events = (await eventsResponse.json()) as EventsResponse;
  if (!events) {
    redirect("/");
  }

  return { user, events };
};

export default function EventsConfig({ loaderData }: Route.ComponentProps) {
  console.log("loaderData", loaderData);
  return <div></div>;
}
