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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="#ffc348"
                  className="size-6 mr-1"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                    clipRule="evenodd"
                  />
                </svg>
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
