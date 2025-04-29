import { Input } from "../ui/input";
import type { paths } from "~/lib/api-types";

export type SearchBookFiltersProps = {
  filters: Omit<
    NonNullable<paths["/api/entries"]["get"]["parameters"]["query"]>,
    "page" | "limit"
  >;
};

export const SearchBooksFilters = ({ filters }: SearchBookFiltersProps) => {
  return (
    <aside className="md:min-h-full w-full md:w-60 flex flex-col items-center gap-4 bg-card-secondary rounded-sm p-1">
      <div>
        <label
          className="text-card-secondary-foreground text-sm"
          htmlFor="author"
        >
          Author:
        </label>
        <Input
          className="w-full h-10"
          id="author"
          name="author"
          placeholder="Author"
          defaultValue={filters.author}
        />
      </div>
      <div>
        <label htmlFor="orderBy">Sort by:</label>
        <select id="orderBy" name="orderBy" defaultValue={filters.orderBy}>
          <option value={undefined}>Default</option>
          <option value="updatedAt">Updated At</option>
          <option value="createdAt">Created At</option>
        </select>
      </div>
    </aside>
  );
};
