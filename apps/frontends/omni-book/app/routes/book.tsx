import { useSearchParams } from "react-router";
import type { Route } from "./+types/book";
import type { paths } from "~/lib/api-types";
import { env } from "~/lib/env";
import Popup from "~/components/ui/popup";
import { FORMAT_INFO } from "~/lib/formats";
import CommentsSection from "~/components/comments";
import Recommended from "~/components/recommended";

type BookResponseType =
  paths["/api/entries/{id}"]["get"]["responses"]["200"]["content"]["application/json"];
type CommentsResponse =
  paths["/api/entries/{entryId}/comments"]["get"]["responses"]["200"]["content"]["application/json"];

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const { bookId } = params;
  const page = Number.parseInt(
    new URL(request.url).searchParams.get("page") || "1"
  );
  const limit = Number.parseInt(
    new URL(request.url).searchParams.get("limit") || "10"
  );

  if (!bookId) {
    throw new Response(JSON.stringify({ error: "No bookId provided" }), {
      status: 400,
    });
  }

  const response = await fetch(`${env.VITE_API_URL}/api/entries/${bookId}`, {
    headers: request.headers,
  });

  if (!response.ok) {
    throw new Response(JSON.stringify({ error: "Book not found" }), {
      status: 404,
    });
  }

  const query = {
    page,
    limit,
  } satisfies paths["/api/entries/{entryId}/comments"]["get"]["parameters"]["query"];
  const commentsResponse = await fetch(
    `${env.VITE_API_URL}/api/entries/${bookId}/comments?${query.toString()}`,
    {
      headers: request.headers,
    }
  );

  const entry: BookResponseType = await response.json();
  const comments: CommentsResponse = await commentsResponse.json();
  return { entry, comments };
};

const Book = ({ loaderData }: Route.ComponentProps) => {
  const { entry, comments } = loaderData;
  const [search, setSearch] = useSearchParams();

  return (
    <>
      <div className="bg-[url('/gradient.jpg')] bg-cover bg-center h-[550px]">
        <div className="px-40 flex items-center justify-between h-full gap-10">
          <div className="h-full">
            <img
              src={
                entry.thumbnail && "url" in entry.thumbnail
                  ? entry.thumbnail.url
                  : "./placeholder.jpg"
              }
              className="py-20 h-full w-auto object-cover"
              alt="thumbnail"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-5xl font-semibold mb-2">{entry.title}</h1>
            <div className="text-lg font-medium mb-3 flex gap-2 items-center">
              <p>{entry.author}</p>
              {entry.year !== null && entry.year !== 0 && (
                <>
                  <div className="w-[2px] h-6 bg-white"></div>
                  <p>{entry.year}</p>
                </>
              )}
            </div>

            <div className="flex flex-row space-x-2 mb-3">
              {entry.genres.map((genre) => (
                <span
                  key={genre}
                  className="bg-card px-2 py-1 rounded-md text-[0.8rem] font-medium"
                >
                  {genre}
                </span>
              ))}
            </div>
            <p className="text-md text-white">
              {entry.description || "No description available"}
            </p>
          </div>
          <div className="bg-[#ffffff33] h-full w-1/4 flex flex-col items-center justify-center p-10">
            <p className="text-xl font-medium mb-6">
              Choose how to read this book
            </p>
            <div className="flex flex-col gap-3 w-full items-start">
              {entry.media.map((media) => (
                <div key={media._id} className="w-full flex items-center gap-4">
                  <a
                    href={
                      "url" in media.mirrors[0].blob
                        ? media.mirrors[0].blob.url
                        : "#"
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="w-3/6 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 px-8 py-4"
                  >
                    {media.meta.format}
                  </a>
                  <p>
                    <strong>
                      {media.mirrors[0].size
                        ? (media.mirrors[0].size / 1000000).toPrecision(3)
                        : "0"}
                    </strong>{" "}
                    MB{" "}
                  </p>
                  {media.meta.format && media.meta.format in FORMAT_INFO && (
                    <Popup content={FORMAT_INFO[media.meta.format]} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="px-10 py-8 flex gap-8 w-full">
        <CommentsSection />
        <Recommended />
      </div>
    </>
  );
};

export default Book;
