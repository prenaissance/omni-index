import type { FC } from "react";
import { Button } from "./ui/button";

const Hero: FC = ({}) => {
  return (
    <div className="flex flex-col items-center justify-center h-96 bg-[url(./hero.jpg)] bg-cover bg-center">
      <div className="flex flex-col items-center justify-center h-96 w-full bg-[#212121bf]">
        <h1 className="text-5xl  text-center text-white">
          Omni<strong>Book</strong>
        </h1>
        <p className="text-lg text-center text-white">
          The best place to find your next read
        </p>
        <div className="flex flex-row space-x-4 mt-4">
          <Button variant={"default"}>Register</Button>
          <Button variant={"secondary"}>Learn More</Button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
