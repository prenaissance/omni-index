import { Link } from "react-router";
import { StarIcon } from "../icons";
import type { paths } from "~/lib/api-types";

type RecommendedCardProps = {
  book: paths["/api/entries/{entryId}"]["get"]["responses"]["200"]["content"]["application/json"];
};

const RecommendedCard = ({ book }: RecommendedCardProps) => {
  return (
    <div className="flex w-full gap-4">
      <Link to={`/books/${book._id}`}>
        <div
          style={{
            backgroundImage: `url(${
              book.thumbnail && "url" in book.thumbnail
                ? book.thumbnail.url
                : "/placeholder.png"
            })`,
            backgroundSize: "cover",
            backgroundPosition: "top left",
            height: "110px",
            width: "90px",
          }}
          className={"h-full"}
        ></div>
      </Link>
      <div className="flex flex-col w-52 justify-center">
        <Link
          to={`/books/${book._id}`}
          className="text-muted-foreground hover:text-primary transition duration-200"
        >
          <p className="whitespace-nowrap overflow-hidden text-ellipsis text-sm font-semibold">
            {book.title}
          </p>
        </Link>
        <Link
          to={`/search?author=${book.author}`}
          className="text-md hover:text-textHover transition duration-200"
        >
          <p className="whitespace-nowrap overflow-hidden text-ellipsis text-sm font-light">
            {book.author}
          </p>
        </Link>
        <div className="flex items-center gap-2">
          {(book.year || book.year != 0) && (
            <p className="whitespace-nowrap overflow-hidden text-ellipsis text-sm font-medium text-white flex items-center gap-2">
              {book?.year || "1900"} <p className="text-2xl">•</p>
            </p>
          )}
          <div className="flex items-center text-xs gap-1">
            <p className="whitespace-nowrap overflow-hidden text-ellipsis text-sm font-medium text-white">
              4.5
            </p>
            <StarIcon size={4} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendedCard;
