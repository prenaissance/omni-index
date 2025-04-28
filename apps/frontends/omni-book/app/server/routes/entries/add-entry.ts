import { redirect } from "react-router";
import { checkCookie } from "../../utils";
import type { Route } from "./+types/add-entry";
import type { components, paths } from "~/lib/api-types";
import { env } from "~/server/env";

type EntryFail =
  paths["/api/entries"]["post"]["responses"]["409"]["content"]["application/json"];

type CreateEntryRequest = components["schemas"]["CreateEntryRequest"];

const validateFormData = (message: string, isHtmlRequest = false) => {
  return isHtmlRequest
    ? redirect(`/admin/add-entry?error=${message}`)
    : new Response(
        JSON.stringify({
          error: message,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
};

export const action = async ({ request }: Route.LoaderArgs) => {
  const formData = await request.formData();
  const isHtmlRequest = request.headers.get("accept")?.includes("text/html");

  const cookieHeader = checkCookie(request);

  const title = formData.get("title") as string;
  const author = formData.get("author") as string;
  const description = formData.get("description") as string | null;
  const localizedTitle = formData.get("localizedTitle") as string | null;
  const year = formData.get("year") ? Number(formData.get("year")) : undefined;
  const language = formData.get("language") as string | undefined;
  const thumbnailUrl = formData.get("thumbnailUrl") as string | undefined;

  const genres = formData.getAll("genres") as string[];

  const medias: CreateEntryRequest["media"] = [];

  if (!title) {
    return validateFormData("Title is required", isHtmlRequest);
  }

  if (!author) {
    return validateFormData("Author is required", isHtmlRequest);
  }

  if (!genres || genres.length === 0) {
    return validateFormData("At least one genre is required", isHtmlRequest);
  }

  const mediaEntries: [string, FormDataEntryValue][] = Array.from(
    formData.entries()
  ).filter(([key]) => key.startsWith("media["));

  const mediaMap = new Map<
    number,
    { mirrors: CreateEntryRequest["media"][number]["mirrors"] }
  >();

  for (const [key, value] of mediaEntries) {
    const match = key.match(/media\[(\d+)\]\[mirrors\]\[0\]\[(.+)\]/);
    if (!match) continue;

    const mediaIndex = Number(match[1]);
    const field = match[2];

    if (!mediaMap.has(mediaIndex)) {
      mediaMap.set(mediaIndex, { mirrors: [{ blob: { url: "" }, meta: {} }] });
    }

    const mirror = mediaMap.get(mediaIndex)!.mirrors[0];

    if (field === "provider" && value) {
      mirror.provider = value.toString();
    }
    if (field === "mimeType" && value) {
      mirror.mimeType = value.toString();
    }
    if (field === "size" && value) {
      mirror.size = Number(value);
    }
    if (field === "blob") {
      mirror.blob = { url: value.toString() };
    }
  }

  for (const [, value] of mediaMap) {
    medias.push({
      mirrors: value.mirrors,
      meta: {},
    });
  }

  if (medias.length === 0) {
    return validateFormData("At least one media is required", isHtmlRequest);
  }

  const entry: CreateEntryRequest = {
    title,
    author,
    description: description ?? undefined,
    localizedTitle: localizedTitle ?? undefined,
    year,
    language,
    thumbnail: thumbnailUrl ? { url: thumbnailUrl } : undefined,
    genres,
    meta: {},
    media: medias,
  };

  const response = await fetch(`${env.API_URL}/api/entries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: cookieHeader,
    },
    body: JSON.stringify(entry),
  });

  if (!response.ok) {
    const error: EntryFail = await response.json();
    return validateFormData(
      error.message || "Error adding entry",
      isHtmlRequest
    );
  }

  if (isHtmlRequest) {
    return redirect(`/admin/add-entry?success=Entry added successfully`);
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
