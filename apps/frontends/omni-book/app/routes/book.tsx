import { Link } from "react-router";
import type { Route } from "./+types/book";
import type { paths } from "~/lib/api-types";
import { env } from "~/lib/env";
import Recommended from "~/components/recommended/recommended";
import { extractFormat } from "~/lib/utils";
import Tooltip from "~/components/ui/tooltip";
import { EditIcon, PopupIcon } from "~/components/icons";
import { Comments } from "~/components/comments/comments";
import { useAuth } from "~/context/auth-context";

type BookResponseType =
  paths["/api/entries/{entryId}"]["get"]["responses"]["200"]["content"]["application/json"];
type CommentsResponse =
  paths["/api/entries/{entryId}/comments"]["get"]["responses"]["200"]["content"]["application/json"];
type BooksResponse =
  paths["/api/entries"]["get"]["responses"]["200"]["content"]["application/json"];

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

  const response = await fetch(`${env.API_URL}/api/entries/${bookId}`, {
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

  const searchParams = new URLSearchParams(query as never);

  const commentsResponse = await fetch(
    `${env.API_URL}/api/entries/${bookId}/comments?${searchParams}`,
    {
      headers: request.headers,
    }
  );

  const entry: BookResponseType = await response.json();
  const comments: CommentsResponse = await commentsResponse.json();

  const author = entry.author;

  const authorBooksQuery = {
    author,
    page: 1,
    limit: 5,
  } satisfies paths["/api/entries"]["get"]["parameters"]["query"];

  const authorBooksSearchParams = new URLSearchParams(
    Object.fromEntries(
      Object.entries(authorBooksQuery).filter(
        ([, value]) => value !== undefined
      )
    ) as Record<string, string>
  );

  const authorBooksResponse = await fetch(
    `${env.API_URL}/api/entries?${authorBooksSearchParams}`,
    {
      headers: request.headers,
    }
  );

  if (!authorBooksResponse.ok) {
    return { entry, comments };
  }

  const authorBooks: BooksResponse = await authorBooksResponse.json();

  const filteredBooks = authorBooks.data.filter(
    (book) => book._id !== entry._id
  ) as BookResponseType[];

  return {
    entry,
    comments,
    filteredBooks,
  };
};

const Book = ({ loaderData }: Route.ComponentProps) => {
  const { entry, comments, filteredBooks } = loaderData;
  const user = useAuth();

  return (
    <>
      <div className="bg-[url('/gradient.jpg')] bg-cover bg-center h-full">
        <div className="flex justify-center items-center lg:px-10 lg:gap-8 lg:flex-row flex-col">
          <div className="flex items-center w-fit gap-8 px-8 min-[525px]:px-10 lg:px-0">
            <div className="h-full md:w-72 min-w-24 min-[525px]:min-w-44 md:min-w-52 hidden min-[700px]:block">
              <img
                src={
                  entry.thumbnail && "url" in entry.thumbnail
                    ? entry.thumbnail.url
                    : "/placeholder.png"
                }
                className="py-12 min-[525px]:py-20 h-full w-full object-cover"
                alt="thumbnail"
              />
            </div>
            <div className="py-10 min-[525px]:py-16 max-w-2xl">
              <div className="flex flex-row items-center gap-8">
                <h1 className="text-2xl min-[525px]:text-5xl font-semibold mb-2">
                  {entry.title}
                </h1>
                {user && (user.role === "admin" || user.role === "owner") && (
                  <Link
                    to={`/admin/edit-entry/${entry._id}`}
                    className="bg-primary text-primary-foreground shadow hover:bg-primary/90 inline-flex disabled:opacity-50inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 px-4 sm:px-8 py-4"
                  >
                    <p>Edit</p>
                    <EditIcon size={4} />
                  </Link>
                )}
              </div>
              <div className="text-lg font-medium mb-3 flex gap-2 items-center">
                <p>{entry.author}</p>
                {entry.year !== null && entry.year !== 0 && (
                  <>
                    <div className="w-[2px] h-6 bg-white"></div>
                    <p>{entry.year}</p>
                  </>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:flex xl:flex-row xl:space-x-2 gap-2 mb-3">
                {entry.genres.map((genre) => (
                  <span
                    key={genre}
                    className="bg-card px-2 py-1 rounded-md text-[0.8rem] font-medium"
                  >
                    {genre}
                  </span>
                ))}
              </div>
              <div className="text-md text-white flex flex-col">
                {entry.description ? (
                  <div>
                    <input
                      type="checkbox"
                      id="read-more-toggle"
                      className="peer hidden"
                    />
                    <p className="peer-checked:line-clamp-none line-clamp-5 transition-all duration-300 text-sm min-[525px]:text-md">
                      {entry.description}
                    </p>
                    <label
                      tabIndex={0}
                      htmlFor="read-more-toggle"
                      className="mt-3 cursor-pointer peer-checked:hidden inline-flex items-center justify-center gap-2 whitespace-nowrap text-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-foreground underline-offset-4 underline hover:text-textHover"
                    >
                      Read More
                    </label>
                    <label
                      tabIndex={0}
                      htmlFor="read-more-toggle"
                      className="mt-3 cursor-pointer hidden peer-checked:inline-block items-center justify-center gap-2 whitespace-nowrap text-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-foreground underline-offset-4 underline hover:text-textHover"
                    >
                      Read Less
                    </label>
                  </div>
                ) : (
                  <>No description available</>
                )}
              </div>
              <div className="h-full w-52 min-[700px]:hidden pt-10 mx-auto">
                <img
                  src={
                    entry.thumbnail && "url" in entry.thumbnail
                      ? entry.thumbnail.url
                      : "/placeholder.png"
                  }
                  className="h-full w-full object-cover"
                  alt="thumbnail"
                />
              </div>
            </div>
          </div>
          <div className="bg-[#ffffff33] sm:min-w-fit lg:w-1/4 flex flex-col items-center justify-center p-10 self-stretch">
            <p className="text-xl font-medium mb-6">
              Choose how to read this book
            </p>
            <div className="flex flex-col gap-3 lg:w-full items-start">
              {entry.media.map((media) => (
                <div
                  key={media._id}
                  className="w-full flex items-center gap-5 justify-between"
                >
                  <Link
                    to={
                      "url" in media.mirrors[0].blob
                        ? media.mirrors[0].blob.url
                        : "#"
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="min-w-52 sm:min-w-64 lg:min-w-fit px-4 lg:flex-1 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 py-4"
                  >
                    {media.meta.format ??
                      extractFormat(media.mirrors[0].mimeType || "").name}
                  </Link>
                  <div className="flex gap-3 min-w-[110px] justify-between">
                    <p className="">
                      <strong>
                        {media.mirrors[0].size
                          ? (media.mirrors[0].size / 1000000).toPrecision(2)
                          : "0"}
                      </strong>{" "}
                      MB{" "}
                    </p>
                    <Tooltip
                      content={
                        extractFormat(media.mirrors[0].mimeType || "")
                          .description
                      }
                      className="lg:w-60 w-40"
                    >
                      <button className="p-0">
                        <PopupIcon />
                      </button>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="px-10 py-8 flex gap-8 w-full md:flex-row flex-col">
        <Comments comments={comments} bookId={entry._id} />
        {filteredBooks && filteredBooks?.length > 0 && (
          <Recommended recommendedBooks={filteredBooks} />
        )}
      </div>
    </>
  );
};

export default Book;
