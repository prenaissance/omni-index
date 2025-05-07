import { BookCard } from "./book-card";
import type { components } from "~/lib/api-types";

export type SearchBooksResultsProps = {
  books: components["schemas"]["Entry"][];
};

export const SearchBookResults = ({ books }: SearchBooksResultsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 min-[1300px]:gap-2 lg:grid-cols-5 w-full">
      {!books || books.length === 0 ? (
        <div className="col-span-2 md:col-span-3 lg:col-span-5">
          <p className="text-center text-lg font-semibold">No results found</p>
        </div>
      ) : (
        books?.map((book) => <BookCard key={book._id} book={book} />)
      )}
    </div>
  );
};
