import { Link } from "react-router";
import { StarIcon } from "../icons";
import type { components } from "~/lib/api-types";

export type BookCardProps = {
  book: components["schemas"]["Entry"];
};

export const BookCard = ({ book }: BookCardProps) => {
  return (
    <article className="flex flex-col items-center justify-normal w-54">
      <Link to={`/books/${book._id}`}>
        <img
          src={
            book.thumbnail && "url" in book.thumbnail
              ? book.thumbnail.url
              : "./placeholder.jpg"
          }
          alt={book.title}
          className="h-48 w-32 object-cover"
        />
      </Link>
      <section className="flex flex-col w-full">
        <Link
          to={`/books/${book._id}`}
          className="lg:text-lg font-semibold overflow-hidden [text-wrap:balance] line-clamp-3 hover:text-textHover transition duration-300 text-center"
        >
          {book.title}
        </Link>
        <div className="flex items-center justify-center text-xs lg:text-sm w-full">
          <div>
            <StarIcon />
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
    </article>
  );
};
