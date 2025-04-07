import { redirect } from "react-router";
import type { Route } from "./+types/delete-comment";
import type { paths } from "~/lib/api-types";
import { env } from "~/server/env";
import { parseCookie } from "~/server/utils";

type CommentFail =
  paths["/api/entries/{entryId}/comments/{tid}"]["delete"]["responses"]["404"]["content"]["application/json"];

type CommentSuccess =
  paths["/api/entries/{entryId}/comments/{tid}"]["delete"]["responses"]["200"]["content"]["application/json"];

export const action = async ({ params, request }: Route.LoaderArgs) => {
  const { bookId, commentId } = params;
  if (!bookId || !commentId) {
    throw new Response(
      JSON.stringify({ error: "No bookId or commentId provided" }),
      {
        status: 400,
      }
    );
  }
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    throw new Response(JSON.stringify({ error: "No cookie provided" }), {
      status: 400,
    });
  }

  const parsedCookie = parseCookie(cookieHeader);
  if (!parsedCookie.session) {
    throw new Response(JSON.stringify({ error: "No session found" }), {
      status: 401,
    });
  }

  const response = await fetch(
    `${env.API_URL}/api/entries/${bookId}/comments/${commentId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        cookie: cookieHeader,
      },
    }
  );

  if (!response.ok) {
    const error: CommentFail = await response.json();
    throw new Response(JSON.stringify(error), {
      status: 404,
    });
  }
  redirect(`/books/${bookId}?page=1&limit=10`);
  const data: CommentSuccess = await response.json();
  return data;
};
