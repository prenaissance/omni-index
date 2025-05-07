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
    <aside className="bg-card-secondary rounded-sm px-8 py-8 ">
      <Form
        action={`/search?query=${filters.search ?? ""}`}
        method="GET"
        className="flex flex-col items-center gap-7 min-w-52 mx-auto"
      >
        <h1 className="font-bold text-xl">Filter Results</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-1 gap-3 w-full">
          <input name="query" className="hidden" value={filters.search ?? ""} />
          <label className="flex flex-col items-end gap-1 w-full">
            <div className="flex min-[1400px]:items-center flex-col min-[1400px]:gap-4 w-full text-sm border-none min-[1400px]:flex-row items-start">
              <p className="w-1/4 font-light">Author</p>
              <input
                id="author"
                name="author"
                type="text"
                className="py-2 px-4 min-[1400px]:w-2/3 w-full bg-card-secondary border-2 border-accent rounded-lg outline-none flex-1"
                placeholder="Author..."
                defaultValue={filters.author}
              />
            </div>
          </label>
          <label className="flex flex-col items-end gap-1 w-full">
            <div className="flex min-[1400px]:items-center min-[1400px]:gap-4 w-full min-[1400px]:flex-row flex-col text-sm border-none">
              <p className="w-1/4 font-light">Year</p>
              <input
                // id="year"
                // name="year"
                type="number"
                className="py-2 px-4 min-[1400px]:w-2/3 w-full bg-card-secondary border-2 border-accent rounded-lg outline-none flex-1 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="Year..."
                // defaultValue={filters.}
              />
            </div>
          </label>
          <label className="flex min-[1400px]:items-center items-start justify-between w-full text-sm min-[1400px]:gap-4 min-[1400px]:flex-row flex-col">
            <p className="min-[1400px]:w-1/4 w-full font-light">Sort by</p>
            <div className="border-2 border-accent rounded-lg flex-1 w-full">
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
