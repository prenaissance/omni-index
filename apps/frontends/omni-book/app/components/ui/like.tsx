import { useState } from "react";
import LikeIcon from "../icons/like";

type LikeButtonProps = {
  initiallyLiked: boolean;
  likes: number;
};

const LikeButton = ({ initiallyLiked, likes }: LikeButtonProps) => {
  const [likeToggled, setLikeToggled] = useState(false);

  return (
    <label className="inline-flex gap-1 items-center cursor-pointer group">
      <input
        type="checkbox"
        className="peer hidden"
        defaultChecked={initiallyLiked}
        onChange={() => {
          setLikeToggled(!likeToggled);
        }}
      />
      <LikeIcon />
      <p>{likeToggled ? (initiallyLiked ? likes - 1 : likes + 1) : likes}</p>
    </label>
  );
};

export default LikeButton;
