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
    <div>
      <div className="flex w-full min-h-40 p-6 gap-4 flex-col md:flex-row">
        <SearchBooksFilters filters={query} />
        <SearchBookResults books={entries.data} />
      </div>
      <SearchBooksPagination {...entries.meta} />
    </div>
  );
};

export default SearchBooks;
