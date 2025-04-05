import { Link } from "react-router";
import StarIcon from "./icons/star";
import type { paths } from "~/lib/api-types";

type BooksResponseType =
  paths["/api/entries"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

type TrendingProps = {
  loaderData: BooksResponseType;
};

const Trending = ({ loaderData }: TrendingProps) => {
  const trendingBooks = loaderData.slice(0, 7);

  return (
    <div className="flex flex-col px-14 items-start py-14">
      <h1 className="text-2xl text-center text-white font-semibold mb-3">
        Trending
      </h1>
      <div className="flex flex-row w-full justify-between">
        {trendingBooks.map((book) => (
          <div key={book._id} className="flex flex-col space-y-4 w-48">
            <Link
              to={`/books/${book._id}`}
              className="h-64 relative bock group"
            >
              <img
                src={
                  book.thumbnail && "url" in book.thumbnail
                    ? book.thumbnail.url
                    : "./placeholder.jpg"
                }
                className="h-64 w-full"
                alt="thumbnail"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition duration-300"></div>
            </Link>
            <div className="flex flex-col">
              <Link
                to={`/books/${book._id}`}
                className="text-lg font-semibold text-ellipsis overflow-hidden text-nowrap hover:text-textHover transition duration-300"
              >
                {book.title}
              </Link>
              <div className="flex items-center text-sm">
                <StarIcon />
                <p className="pt-1 mr-2">4.5</p>
                <div className="w-[1px] h-4 bg-white mr-2"></div>
                <a
                  // href={`/authors/${book.author}`}
                  href={"#"}
                  target="_blank"
                  rel="noreferrer"
                  className="text-md pt-1 hover:text-textHover transition duration-300 text-ellipsis overflow-hidden text-nowrap"
                >
                  {book.author}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Trending;
