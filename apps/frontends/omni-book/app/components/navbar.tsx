import Menu from "./icons/menu";
import Search from "./icons/search";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const Navbar = ({}) => {
  return (
    <nav className="sticky top-0 bg-background">
      <div className="py-5 px-10 flex flex-row items-center justify-between">
        <div className="flex flex-row space-x-14">
          <Button variant={"icon"} size={"icon"}>
            <Menu />
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
                <Input id="landing-search" placeholder="Search..."></Input>
                <Button
                  type="submit"
                  variant={"icon"}
                  size={"icon"}
                  className="absolute top-0 right-1"
                >
                  <Search />
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
