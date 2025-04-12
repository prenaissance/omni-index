import { useFetcher } from "react-router";
import LikeIcon from "./icons/like";
import Popup from "./ui/popup";
import { Button } from "./ui/button";

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
          <Popup content="Log in to like" className="w-20" bg="background">
            <LikeIcon />
          </Popup>
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
