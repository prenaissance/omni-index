import { Link } from "react-router";
import { StarIcon } from "../icons";
import type { components } from "~/lib/api-types";

export type BookCardProps = {
  book: components["schemas"]["Entry"];
};

export const BookCard = ({ book }: BookCardProps) => {
  return (
    <article className="flex flex-col items-center justify-center bg-card-secondary rounded-md px-4">
      <div className="flex flex-col items-center justify-center gap-2">
        <Link to={`/books/${book._id}`}>
          <img
            src={
              book.thumbnail && "url" in book.thumbnail
                ? book.thumbnail.url
                : "./placeholder.jpg"
            }
            alt={book.title}
            className="h-48 w-40 object-left-top"
          />
        </Link>
        <section className="flex flex-col w-full">
          <Link
            to={`/books/${book._id}`}
            className="font-semibold overflow-hidden text-ellipsis whitespace-nowrap hover:text-textHover transition duration-300 text-base text-center w-44 mx-auto"
          >
            {book.title}
          </Link>
          <div className="flex items-center justify-center text-xs lg:text-sm w-44 mx-auto">
            <div>
              <StarIcon size={4} />
            </div>
            <p className="pt-1 mr-2">4.5</p>
            <div className="w-[1px] h-4 bg-white mr-2"></div>
            <Link
              to={`/search?author=${book.author}`}
              className="text-md pt-1 hover:text-textHover transition duration-300 text-ellipsis overflow-hidden text-nowrap"
            >
              {book.author}
            </Link>
          </div>
        </section>
      </div>
    </article>
  );
};
