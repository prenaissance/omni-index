import type { FC } from "react";
import Navbar from "../navbar";
import "../../app.css";
type LandingProps = {};

const Landing: FC<LandingProps> = ({}) => {
  return (
    <div>
      <Navbar />
      <h1>Landing Page</h1>
    </div>
  );
};

export default Landing;
