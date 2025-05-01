import { BookCard } from "./book-card";
import type { components } from "~/lib/api-types";

export type SearchBooksResultsProps = {
  books: components["schemas"]["Entry"][];
};

export const SearchBookResults = ({ books }: SearchBooksResultsProps) => {
  return (
    <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-8 lg:grid-cols-5">
      {books.map((book) => (
        <BookCard key={book._id} book={book} />
      ))}
    </div>
  );
};
