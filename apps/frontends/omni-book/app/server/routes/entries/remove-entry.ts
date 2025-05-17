import { redirect } from "react-router";
import { checkCookie } from "../../utils";
import type { Route } from "./+types/remove-entry";
import type { paths } from "~/lib/api-types";
import { env } from "~/server/env";
import { validateFormData } from "~/lib/utils";

type EntryFail =
  paths["/api/entries/{entryId}"]["delete"]["responses"]["404"]["content"]["application/json"];

export const action = async ({ request, params }: Route.LoaderArgs) => {
  const bookId = params.bookId;
  const isHtmlRequest = request.headers.get("accept")?.includes("text/html");

  if (!bookId) {
    throw new Response("Book ID is required", { status: 400 });
  }

  const cookieHeader = checkCookie(request);

  const response = await fetch(`${env.API_URL}/api/entries/${bookId}`, {
    method: "DELETE",
    headers: {
      cookie: cookieHeader,
    },
  });

  if (!response.ok) {
    const error: EntryFail = await response.json();
    return validateFormData(
      error.message || "Error deleting entry",
      isHtmlRequest
    );
  }

  return redirect(`/?success=Entry removed successfully`);
};
