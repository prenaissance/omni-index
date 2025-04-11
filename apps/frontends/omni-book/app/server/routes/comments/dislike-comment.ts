import { redirect } from "react-router";
import type { Route } from "./+types/dislike-comment";
import type { paths } from "~/lib/api-types";
import { env } from "~/server/env";
import { parseCookie } from "~/server/utils";

type CommentLikeFail =
  paths["/api/entries/{entryId}/comments/{tid}/like"]["post"]["responses"]["404"]["content"]["application/json"];

export const action = async ({ params, request }: Route.LoaderArgs) => {
  const { bookId, commentId } = params;
  const isHtmlRequest = request.headers.get("accept")?.includes("text/html");

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
    `${env.API_URL}/api/entries/${bookId}/comments/${commentId}/like`,
    {
      method: "DELETE",
      headers: {
        cookie: cookieHeader,
      },
    }
  );

  if (!response.ok) {
    const error: CommentLikeFail = await response.json();
    throw new Response(JSON.stringify(error), {
      status: 404,
    });
  }

  if (isHtmlRequest) {
    return redirect(
      `/books/${bookId}?page=${params.page || 1}&limit=${params.limit || 10}`
    );
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
