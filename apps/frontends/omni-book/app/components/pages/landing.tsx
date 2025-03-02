import type { FC } from "react";
import Navbar from "../navbar";
import "../../app.css";
import Hero from "../hero";

const Landing: FC = ({}) => {
  return (
    <div>
      <Navbar />
      <Hero />
    </div>
  );
};

export default Landing;
