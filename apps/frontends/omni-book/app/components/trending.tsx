import Star from "./icons/star";
import type { paths } from "~/lib/api-types";

type BooksResponseType =
  paths["/api/entries"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

type TrendingProps = {
  loaderData: BooksResponseType;
};

const Trending = ({ loaderData }: TrendingProps) => {
  return (
    <div className="flex flex-col px-14 items-start py-14">
      <h1 className="text-2xl text-center text-white font-semibold mb-3">
        Trending
      </h1>
      <div className="flex flex-row space-x-12 ">
        {loaderData.map((book) => (
          <div key={book._id} className="flex flex-col space-y-4 w-48">
            <a
              href={`/books/${book._id}`}
              className="h-64 relative bock group"
              target="_blank"
              rel="noreferrer"
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
            </a>
            <div className="flex flex-col">
              <a
                href={`/books/${book._id}`}
                target="_blank"
                rel="noreferrer"
                className="text-lg font-semibold text-ellipsis overflow-hidden text-nowrap hover:text-textHover transition duration-300"
              >
                {book.title}
              </a>
              <div className="flex items-center text-sm">
                <Star />
                <p className="pt-1 mr-2">4.5</p>
                <div className="w-[1px] h-4 bg-white mr-2"></div>
                <a
                  // href={`/authors/${book.author}`}
                  href={"#"}
                  target="_blank"
                  rel="noreferrer"
                  className="text-md pt-1 hover:text-textHover transition duration-300"
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
