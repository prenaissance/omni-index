import { Link } from "react-router";
import { Button } from "./ui/button";
import { TextArea } from "./ui/text-area";
import { useAuth } from "~/context/auth-context";
import type { paths } from "~/lib/api-types";

type CommentsResponse =
  paths["/api/entries/{entryId}/comments"]["get"]["responses"]["200"]["content"]["application/json"];

type CommentsProps = {
  comments: CommentsResponse;
};

const Comments = ({ comments }: CommentsProps) => {
  const { user } = useAuth();
  return (
    <div className="w-2/3 flex flex-col gap-5">
      <div className="w-full rounded-lg bg-card overflow-hidden group relative">
        <div className="relative pb-14">
          <TextArea
            className="w-full h-full resize-none px-10 py-8 text-sm"
            rows={2}
            placeholder="Add comment..."
            disabled={!user}
          />
          <Button className="absolute bottom-3 right-5" disabled={!user}>
            Submit
          </Button>
        </div>
        {!user && (
          <div className="absolute inset-0 bg-gradient-to-r from-stone-700/70 to-stone-800/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-foreground text-lg font-semibold">
              <h2>
                <span>
                  <Link
                    to={"/login"}
                    className="text-primary underline-offset-4 hover:underline inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 p-0 m-0 pr-2 text-md font-bold"
                  >
                    Log in
                  </Link>
                </span>
                to leave a comment
              </h2>
            </span>
          </div>
        )}
      </div>
      <div className="w-full h-[2px] bg-card"></div>
      <div className="py-4 pl-8 rounded-md flex justify-between">
        <h2>Comments</h2>
        {comments.length > 0 ? (
          <p className="text-sm text-muted-foreground">
            {comments.length} comments
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">No comments yet</p>
        )}
      </div>
    </div>
  );
};

export default Comments;
