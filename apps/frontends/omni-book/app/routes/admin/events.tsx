import { redirect, useSearchParams } from "react-router";
import type { Route } from "./+types/events";
import { checkCookie } from "~/server/utils";
import { env } from "~/lib/env";
import type { paths } from "~/lib/api-types";
import EventsTable from "~/components/admin/events-inbox/events-table";
import { SearchBooksPagination } from "~/components/search-books/search-books-pagination";

type Profile =
  paths["/api/profile"]["get"]["responses"]["200"]["content"]["application/json"];

type EventsResponse =
  paths["/api/events"]["get"]["responses"]["200"]["content"]["application/json"];

type Statuses =
  | ("pending" | "accepted" | "rejected")
  | ("pending" | "accepted" | "rejected")[]
  | undefined;

export const loader = async ({ request }: Route.LoaderArgs) => {
  const cookieHeader = checkCookie(request);

  const searchParams = new URL(request.url).searchParams;
  const page = Number.parseInt(searchParams.get("page") || "1");
  const limit = Number.parseInt(searchParams.get("limit") || "10");

  const rawStatuses = searchParams.getAll("statuses") as Statuses;
  const statuses = Array.isArray(rawStatuses) ? rawStatuses : [];

  const res = await fetch(`${env.API_URL}/api/profile`, {
    method: "GET",
    credentials: "include",
    headers: {
      cookie: cookieHeader,
    },
  });

  if (!res.ok) {
    return redirect("/");
  }

  const user = (await res.json()) as Profile;

  if (user.role !== "admin" && user.role !== "owner") {
    return redirect("/");
  }

  const querySearchParams = new URLSearchParams();
  querySearchParams.set("page", String(page));
  querySearchParams.set("limit", String(limit));

  statuses.forEach((s) => querySearchParams.append("statuses", s));

  const targetUrl = `${env.API_URL}/api/events?${querySearchParams.toString()}`;

  const eventsResponse = await fetch(targetUrl, {
    method: "GET",
    credentials: "include",
    headers: {
      cookie: cookieHeader,
    },
  });

  if (!eventsResponse.ok) {
    return redirect("/");
  }

  const events = (await eventsResponse.json()) as EventsResponse;
  if (!events) {
    return redirect("/");
  }

  return { user, events };
};

export default function EventsConfig({ loaderData }: Route.ComponentProps) {
  const { events } = loaderData;
  const [searchParams] = useSearchParams();
  const page = searchParams.get("page") ?? "1";
  const limit = searchParams.get("limit") ?? "10";
  return (
    <div className="flex flex-col h-full">
      <div className="m-10 mb-5 rounded-lg bg-card pl-10 pr-6 py-5 relative">
        <div className="flex items-center justify-between mb-2 pr-4">
          <h1 className="text-2xl font-bold">Updates Inbox</h1>
        </div>
        <EventsTable events={events.events} />
        <div className="absolute right-4 bottom-4 min-w-[30%] whitespace-nowrap"></div>
      </div>
      <SearchBooksPagination
        limit={Number.parseInt(limit)}
        page={Number.parseInt(page)}
        total={events.total}
      />
    </div>
  );
}
