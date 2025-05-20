import { redirect } from "react-router";
import type { Route } from "./+types/events";
import { checkCookie } from "~/server/utils";
import { env } from "~/lib/env";
import type { paths } from "~/lib/api-types";
import { FilterIcon } from "~/components/icons";
import StatusDropdown from "~/components/admin/events-inbox/status-dropdown";

type Profile =
  paths["/api/profile"]["get"]["responses"]["200"]["content"]["application/json"];

type EventsResponse =
  paths["/api/events"]["get"]["responses"]["200"]["content"]["application/json"];

type EventsQuery = NonNullable<
  paths["/api/events"]["get"]["parameters"]["query"]
>;
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
  return (
    <div className="flex flex-col h-full">
      <div className="m-10 rounded-lg bg-card pl-10 pr-6 py-5 relative">
        <div className="flex items-center justify-between mb-2 pr-4">
          <h1 className="text-2xl font-bold">Updates Inbox</h1>
        </div>
        <div
          className={`h-[calc(100vh-240px)] pr-4 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-card-secondary [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-lg [&::-webkit-scrollbar:horizontal]:h-1
    [&::-webkit-scrollbar:vertical]:w-1 [&::-webkit-scrollbar-corner]:bg-transparent`}
        >
          <table className="w-full">
            <thead className="sticky top-0 bg-card z-10">
              <tr className="text-md font-medium text-accent border-collapse">
                <th className="text-left w-[20%]">Created At</th>
                <th className="text-left w-[20%]">Type</th>
                <th className="text-left w-[20%]">Node URL</th>
                <th className="text-left w-[20%] ">
                  <StatusDropdown />
                </th>
                <th className="text-left w-[20%]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-card-secondary"></tbody>
          </table>
        </div>
        <div className="absolute right-4 bottom-4 min-w-[30%] whitespace-nowrap">
          {/* {errorMessage ? (
            <Notification
              variant={"danger"}
              closeButtonLink={"/admin/nodes-config"}
            >
              {errorMessage}
            </Notification>
          ) : successMessage ? (
            <Notification
              variant={"success"}
              closeButtonLink={"/admin/nodes-config"}
            >
              {successMessage}
            </Notification>
          ) : null} */}
        </div>
      </div>
    </div>
  );
}
