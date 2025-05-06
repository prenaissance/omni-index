import { Form } from "react-router";
import { SearchIcon } from "../icons";
import { Button } from "../ui/button";
import type { paths } from "~/lib/api-types";

export type SearchBookFiltersProps = {
  filters: Omit<
    NonNullable<paths["/api/entries"]["get"]["parameters"]["query"]>,
    "page" | "limit"
  >;
};

export const SearchBooksFilters = ({ filters }: SearchBookFiltersProps) => {
  return (
    <aside className="w-80 bg-card-secondary rounded-sm px-8 py-8">
      <Form
        action={`/search?query=${filters.search ?? ""}`}
        method="GET"
        className="flex flex-col items-center gap-7"
      >
        <h1 className="font-bold text-xl">Filter Results</h1>
        <div className="flex flex-col gap-3 w-full">
          <input name="query" className="hidden" value={filters.search ?? ""} />
          <label className="flex flex-col items-end gap-1 w-full">
            <div className="flex items-center gap-4 w-full text-sm border-none">
              <p className="w-1/4 font-light">Author</p>
              <input
                id="author"
                name="author"
                type="text"
                className="py-2 px-4 w-2/3 bg-card-secondary border-2 border-accent rounded-lg outline-none flex-1"
                placeholder="Author..."
                defaultValue={filters.author}
              />
            </div>
          </label>
          <label className="flex flex-col items-end gap-1 w-full">
            <div className="flex items-center gap-4 w-full text-sm border-none">
              <p className="w-1/4 font-light">Year</p>
              <input
                // id="year"
                // name="year"
                type="number"
                className="py-2 px-4 w-2/3 bg-card-secondary border-2 border-accent rounded-lg outline-none flex-1 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="Year..."
                // defaultValue={filters.}
              />
            </div>
          </label>
          <label className="flex items-center justify-between w-full text-sm gap-4">
            <p className="w-1/4 font-light">Sort by</p>
            <div className="border-2 border-accent rounded-lg flex-1">
              <select
                id="orderBy"
                name="orderBy"
                defaultValue={filters.orderBy}
                className="py-2 px-4 border-r-8 border-r-transparent w-full bg-card-secondary rounded-lg outline-none"
              >
                <option value="updatedAt">Updated At</option>
                <option value="createdAt">Created At</option>
              </select>
            </div>
          </label>
        </div>
        <Button className="w-full self-end" type="submit">
          <span>Search</span>
          <SearchIcon size={4} />
        </Button>
      </Form>
    </aside>
  );
};
