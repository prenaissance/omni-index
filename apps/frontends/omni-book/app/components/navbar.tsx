import type { FC } from "react";
import { Button } from "./ui/button";

const Navbar: FC = ({}) => {
  return (
    <nav>
      <div className=" py-5 px-10 flex flex-row items-center justify-between">
        <div className="flex flex-row space-x-14">
          <Button variant={"icon"} size={"icon"}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z"
                clipRule="evenodd"
              />
            </svg>
          </Button>
          <a className="flex flex-row space-x-2 items-center h-fit" href="/">
            <img
              src={"/ui-logo.svg"}
              alt="ui-logo"
              height={"40px"}
              width={"40px"}
            />
            <div className="flex flex-col space-y-0">
              <h6 className="leading-4 text-md">Omni</h6>
              <h1 className="text-2xl font-bold leading-5">
                <strong>Book</strong>
              </h1>
            </div>
          </a>
          <div className="h-10">
            <form className="h-full">
              <label
                htmlFor="landing-search"
                className="mb-2 text-sm font-medium text-foreground sr-only"
              >
                Search
              </label>
              <div className="relative h-full">
                <input
                  id="landing-search"
                  className="pl-6 pr-12 block h-full w-80 text-sm border rounded-md bg-card border-border text-card-foreground focus:ring-0 focus:border-none outline-none"
                  placeholder="Search..."
                />
                <Button
                  type="submit"
                  variant={"icon"}
                  size={"icon"}
                  className="absolute top-0 right-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-6"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Button>
              </div>
            </form>
          </div>
        </div>
        <div>
          <Button>Login</Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
