import { Link } from "react-router";
import { StarIcon } from "../icons";
import type { components } from "~/lib/api-types";

export type BookCardProps = {
  book: components["schemas"]["Entry"];
};

export const BookCard = ({ book }: BookCardProps) => {
  const thumbnailUrl =
    book.thumbnail && "url" in book.thumbnail
      ? book.thumbnail.url
      : "/thumbnail.png";

  return (
    <article className="flex flex-col h-full w-full rounded-md overflow-hidden items-center justify-center">
      <Link to={`/books/${book._id}`} className="w-full">
        <div
          className="aspect-[3/4] mx-auto bg-cover bg-top-left rounded w-full max-w-40"
          style={{ backgroundImage: `url(${thumbnailUrl})` }}
        />
      </Link>

      <section className="flex flex-col w-full gap-1 mt-2 overflow-hidden">
        <Link
          to={`/books/${book._id}`}
          className="font-semibold text-base text-center truncate w-full"
          title={book.title}
        >
          {book.title}
        </Link>

        <div className="flex items-center justify-center text-xs lg:text-sm gap-2 w-full overflow-hidden text-ellipsis whitespace-nowrap">
          <div>
            <StarIcon size={4} />
          </div>
          <p className="pt-0.5">4.5</p>
          <div className="w-[1px] h-4 bg-white" />
          <Link
            to={`/search?author=${book.author}`}
            className="hover:text-textHover transition duration-300 truncate max-w-[50%]"
            title={book.author}
          >
            {book.author}
          </Link>
        </div>
      </section>
    </article>
  );
};
