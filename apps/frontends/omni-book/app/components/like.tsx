import { useFetcher } from "react-router";
import LikeIcon from "./icons/like";
import { Button } from "./ui/button";
import Tooltip from "./ui/tooltip";

type LikeButtonProps = {
  initiallyLiked: boolean;
  likes: number;
  bookId: string;
  commentId: string;
  disabled?: boolean;
};

const LikeButton = ({
  initiallyLiked,
  likes,
  bookId,
  commentId,
  disabled,
}: LikeButtonProps) => {
  const fetcher = useFetcher();

  return (
    <div className="inline-flex gap-1 items-center ">
      {disabled ? (
        <div>
          <Tooltip
            content="Log in to like"
            className="w-[70px]"
            variant={"dark"}
          >
            <LikeIcon />
          </Tooltip>
        </div>
      ) : (
        <fetcher.Form
          action={
            initiallyLiked
              ? `/api/entries/${bookId}/comments/${commentId}/dislike`
              : `/api/entries/${bookId}/comments/${commentId}/like`
          }
          method={"POST"}
          className="flex gap-1 items-center"
        >
          <Button
            type="submit"
            variant="icon"
            size="icon"
            className="p-0 m-0 w-fit h-fit"
          >
            <LikeIcon fill={initiallyLiked} />
          </Button>
        </fetcher.Form>
      )}
      <span className="text-sm text-muted-foreground">{likes}</span>
    </div>
  );
};

export default LikeButton;
