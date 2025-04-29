import { Link } from "react-router";
import { StarIcon } from "./icons";
import type { paths } from "~/lib/api-types";

type BooksResponseType =
  paths["/api/entries"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

type LatestProps = {
  latestBooks: BooksResponseType;
};

const Latest = ({ latestBooks }: LatestProps) => {
  return (
    <div className="flex flex-col px-14 items-start py-14">
      <h1 className="text-2xl text-center text-white font-semibold mb-3">
        Latest
      </h1>
      <div className="grid grid-cols-2 min-[500px]:grid-cols-3 sm:grid-cols-4 xl:grid-cols-7 w-full gap-4 md:gap-8 lg:gap-20 xl:gap-8 2xl:gap-16">
        {latestBooks.map((book) => (
          <div key={book._id} className="flex flex-col space-y-2 lg:space-y-4">
            <Link
              to={`/books/${book._id}`}
              className="h-52 md:h-64 min-[2000px]:h-80 relative bock group"
            >
              <div
                style={{
                  backgroundImage: `url(${
                    book.thumbnail && "url" in book.thumbnail
                      ? book.thumbnail.url
                      : "../../public/placeholder.png"
                  })`,
                  backgroundSize: "cover",
                  backgroundPosition: "top left",
                }}
                className={"h-full"}
              ></div>
            </Link>
            <div className="flex flex-col">
              <Link
                to={`/books/${book._id}`}
                className="lg:text-lg font-semibold text-ellipsis overflow-hidden text-nowrap hover:text-textHover transition duration-300"
              >
                {book.title}
              </Link>
              <div className="flex items-center text-xs lg:text-sm">
                <div>
                  <StarIcon />
                </div>
                <p className="pt-1 mr-2">4.5</p>
                <div className="w-[1px] h-4 bg-white mr-2"></div>
                <Link
                  // to={`/authors/${book.author}`}
                  to={"#"}
                  target="_blank"
                  rel="noreferrer"
                  className="text-md pt-1 hover:text-textHover transition duration-300 text-ellipsis overflow-hidden text-nowrap"
                >
                  {book.author}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Latest;
