import { redirect } from "react-router";
import { parseCookie } from "../../utils";
import type { Route } from "./+types/add-comment";
import type { paths } from "~/lib/api-types";
import { env } from "~/server/env";

type CommentFail =
  paths["/api/entries/{entryId}/comments"]["post"]["responses"]["400"]["content"]["application/json"];

export const action = async ({ params, request }: Route.LoaderArgs) => {
  const { bookId } = params;
  const formData = await request.formData();
  const text = formData.get("text") as string;

  if (!bookId) {
    throw new Response(JSON.stringify({ error: "No bookId provided" }), {
      status: 400,
    });
  }

  if (!text) {
    return redirect(`/books/${bookId}?page=1&limit=10&error=empty`);
  }

  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return { user: null };
  }

  const parsedCookie = parseCookie(cookieHeader);
  if (!parsedCookie.session) {
    return { user: null };
  }

  const response = await fetch(
    `${env.API_URL}/api/entries/${bookId}/comments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: cookieHeader,
      },
      body: JSON.stringify({ text }),
    }
  );

  if (!response.ok) {
    const error: CommentFail = await response.json();
    throw new Response(JSON.stringify(error), {
      status: 400,
    });
  }

  return redirect(`/books/${bookId}`);
};
