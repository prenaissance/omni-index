import type { Route } from "./+types/search";
import { env } from "~/server/env";
import type { paths } from "~/lib/api-types";
import { SearchBooksFilters } from "~/components/search-books/search-books-filters";
import { SearchBookResults } from "~/components/search-books/search-books-results";
import { SearchBooksPagination } from "~/components/search-books/search-books-pagination";

type EntriesQuery = NonNullable<
  paths["/api/entries"]["get"]["parameters"]["query"]
>;
type EntriesResponse =
  paths["/api/entries"]["get"]["responses"]["200"]["content"]["application/json"];

export const loader = async ({ request }: Route.LoaderArgs) => {
  const searchParams = new URL(request.url).searchParams;
  const search = searchParams.get("query") ?? undefined;
  const page = Number.parseInt(searchParams.get("page") || "1");
  const limit = Number.parseInt(searchParams.get("limit") || "10");
  const author = searchParams.get("author") ?? undefined;
  const orderBy: EntriesQuery["orderBy"] =
    (searchParams.get("orderBy") as never) ?? undefined;

  const query: EntriesQuery = {
    search,
    page,
    limit,
    author,
    orderBy,
  };

  const querySearchParams = new URLSearchParams(
    Object.fromEntries(
      Object.entries(query).filter(([, value]) => value !== undefined)
    ) as Record<string, string>
  );
  const targetUrl = `${env.API_URL}/api/entries?${querySearchParams.toString()}`;

  const response = await fetch(targetUrl);

  const entries: EntriesResponse = await response.json();
  return { entries, query };
};

const SearchBooks = ({ loaderData }: Route.ComponentProps) => {
  const { entries, query } = loaderData;

  return (
    <div className="h-full flex flex-col gap-4 md:h-[calc(100vh-80px)]">
      <div className="flex w-full min-h-40 px-10 py-8 min-[1400px]:gap-8 gap-8 flex-col md:flex-row bg-card flex-1">
        <SearchBooksFilters filters={query} />
        <SearchBookResults books={entries.data} />
      </div>
      <div className="h-fit justify-self-end mb-4">
        <SearchBooksPagination {...entries.meta} />
      </div>
    </div>
  );
};

export default SearchBooks;
