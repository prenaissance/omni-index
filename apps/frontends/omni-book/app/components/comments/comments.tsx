import { Form, Link, useSearchParams, NavLink } from "react-router";
import { useEffect, useState } from "react";
import { TextArea } from "../ui/text-area";
import { Button } from "../ui/button";
import { ChevronIcon, TrashIcon } from "../icons";
import Confirmation from "../ui/confirmation";
import LikeButton from "./like";
import type { paths } from "~/lib/api-types";
import { useAuth } from "~/context/auth-context";

type CommentsResponse =
  paths["/api/entries/{entryId}/comments"]["get"]["responses"]["200"]["content"]["application/json"];

type CommentsProps = {
  comments: CommentsResponse;
  bookId: string;
};

export const Comments = ({ comments, bookId }: CommentsProps) => {
  const [searchParams] = useSearchParams();
  const user = useAuth();
  const [comment, setComment] = useState("");
  const [pageLoaded, setPageLoaded] = useState(false);
  const page = Number.parseInt(searchParams.get("page") || "1");
  const limit = Number.parseInt(searchParams.get("limit") || "10");

  useEffect(() => {
    setPageLoaded(true);
    setComment("");
  }, []);

  const isButtonDisabled = comment?.trim()?.length === 0 && pageLoaded;
  return (
    <div className="w-full flex flex-col gap-5">
      <div className="w-full rounded-lg bg-card overflow-hidden group relative">
        <div className="pb-14">
          <Form
            className="w-full h-full flex flex-col gap-2 mb-2"
            action={`/api/entries/${bookId}/comments`}
            method="POST"
            key={comments.comments.length}
            onSubmit={() => {
              setComment("");
            }}
          >
            <TextArea
              onInput={(e) => {
                e.currentTarget.style.height = "auto";
                e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
              }}
              className="resize-none w-full px-10 pt-8 text-sm"
              rows={2}
              placeholder="Add comment..."
              disabled={!user}
              name="text"
              onChange={(e) => {
                setComment(e.target.value);
              }}
              value={comment}
            />
            <Button
              type="submit"
              className="absolute bottom-3 right-5 w-32"
              disabled={!user || isButtonDisabled}
            >
              Submit
            </Button>
          </Form>
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
      {searchParams.get("error") === "empty" && (
        <p className="text-red-500 text-sm">Comment cannot be empty</p>
      )}
      <div className="w-full h-[2px] bg-card"></div>
      <div className="py-4 pl-8 rounded-md flex justify-between">
        <h2>Comments</h2>
        {comments.comments.length > 0 ? (
          <p className="text-sm text-muted-foreground">
            {comments.comments.length} comments
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">No comments yet</p>
        )}
      </div>
      {comments.comments.map((comment) => (
        <div
          key={comment.tid}
          className="w-full rounded-lg bg-card overflow-hidden flex flex-col justify-between p-4"
        >
          <div className="flex justify-between items-center mb-2 w-full">
            <div className="flex gap-3 items-center">
              <img
                src={comment.createdBy.avatarUrl ?? "/avatar-placeholder.png"}
                alt="avatar"
                className="w-8 h-8 rounded-full"
              />
              <h2 className="text-sm font-semibold text-foreground">
                {comment.createdBy.displayName ?? "Anonymous"}
              </h2>
            </div>
            {user && comment.createdBy.did === user?.did && (
              <div>
                <input
                  type="checkbox"
                  id={`delete-comment-${comment.tid}`}
                  className="peer hidden"
                />
                <label
                  htmlFor={`delete-comment-${comment.tid}`}
                  className="cursor-pointer flex items-center gap-4"
                >
                  <div className="text-destructive">
                    <TrashIcon />
                  </div>
                </label>
                <div className="hidden peer-checked:block">
                  <Confirmation
                    description="Are you sure you want to delete this comment?"
                    title="Delete comment"
                    confirmButtonText="Delete"
                    cancelButtonText="Cancel"
                    action={`/api/entries/${bookId}/comments/${comment.tid}`}
                    htmlFor={`delete-comment-${comment.tid}`}
                    method="DELETE"
                  ></Confirmation>
                </div>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{comment.text}</p>
          <div className="self-end flex gap-3">
            <div className="flex gap-1 items-center">
              <LikeButton
                initiallyLiked={comment.liked}
                likes={comment.likes}
                bookId={bookId}
                commentId={comment.tid}
                disabled={!user}
              />
            </div>
          </div>
        </div>
      ))}
      {comments.comments.length > 0 && (
        <div className="flex justify-center items-center mt-4">
          <NavLink
            to={`/books/${bookId}?page=${page - 1}&limit=${limit}`}
            className={`${
              page === 1
                ? "hidden"
                : "text-sm text-muted-foreground hover:text-primary"
            }`}
          >
            <ChevronIcon size={4} direction="left" />
          </NavLink>
          <span className="text-sm text-muted-foreground mx-2">
            Page {page}
          </span>
          <NavLink
            to={`/books/${bookId}?page=${page + 1}&limit=${limit}`}
            className={`${
              comments.comments.length < limit
                ? "hidden"
                : "text-sm text-muted-foreground hover:text-primary"
            }`}
          >
            <ChevronIcon size={4} direction="right" />
          </NavLink>
        </div>
      )}
    </div>
  );
};
