import RecommendedCard from "./recommended-card";
import type { paths } from "~/lib/api-types";

type RecommendedProps = {
  recommendedBooks: paths["/api/entries/{entryId}"]["get"]["responses"]["200"]["content"]["application/json"][];
};

const Recommended = ({ recommendedBooks }: RecommendedProps) => {
  return (
    <div className="bg-card py-5 px-8 rounded-xl">
      <h2 className="font-semibold text-primary text-lg mb-2">
        Recommended Books
      </h2>
      {recommendedBooks.length > 0 ? (
        <div className="flex flex-col gap-4">
          {recommendedBooks.map((book) => (
            <div key={book._id} className="flex flex-col gap-4">
              <div className="bg-card-secondary h-[2px] rounded-lg"></div>
              <RecommendedCard book={book} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No recommendations available</p>
      )}
    </div>
  );
};

export default Recommended;
