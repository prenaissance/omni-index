import { redirect } from "react-router";
import { checkCookie } from "../../utils";
import type { Route } from "./+types/update-event";
import { env } from "~/server/env";

export const action = async ({ request, params }: Route.LoaderArgs) => {
  const eventId = params.eventId;
  const formData = await request.formData();
  const status = formData.get("status") as string;
  const isHtmlRequest = request.headers.get("accept")?.includes("text/html");

  if (!eventId) {
    throw new Response("Book ID is required", { status: 400 });
  }

  const cookieHeader = checkCookie(request);

  const response = await fetch(`${env.API_URL}/api/events/${eventId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      cookie: cookieHeader,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.json();
    return isHtmlRequest
      ? redirect(`/admin/events?error=${error.message}`)
      : new Response(
          JSON.stringify({
            error: error.message || "Failed to update event status",
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
    return redirect(`/admin/events?success=Event status updated successfully`);
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
