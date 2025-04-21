import { Link, NavLink, Outlet } from "react-router";
import { memo } from "react";
import { Button } from "../ui/button";
import { SearchIcon } from "../icons";
import type { Route } from "./+types/navbar";
import { Profile } from "./profile";
import type { paths } from "~/lib/api-types";
import { env } from "~/lib/env";
import { parseCookie } from "~/server/utils";
import { AuthContext } from "~/context/auth-context";

type ProfileType =
  paths["/api/profile"]["get"]["responses"]["200"]["content"]["application/json"];

export const loader = async ({ request }: Route.LoaderArgs) => {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return { user: null };
  }

  const parsedCookie = parseCookie(cookieHeader);
  if (!parsedCookie.session) {
    return { user: null };
  }

  const res = await fetch(`${env.API_URL}/api/profile`, {
    method: "GET",
    credentials: "include",
    headers: {
      cookie: cookieHeader,
    },
  });

  if (!res.ok) {
    return { user: null };
  }

  const user = (await res.json()) as ProfileType;
  return { user };
};

const Navbar = ({ loaderData }: Route.ComponentProps) => {
  return (
    <AuthContext.Provider value={loaderData.user}>
      <nav className="sticky top-0 bg-background z-50">
        <div className="py-5 px-4 min-[525px]:px-10 flex flex-row items-center justify-between">
          <div className="flex flex-row space-x-2 min-[525px]:space-x-2 min-[580px]:space-x-8 md:space-x-14">
            <NavLink
              className="flex flex-row space-x-2 items-center min-h-[40px] max-[525px]:hidden"
              to="/"
            >
              <img
                src={"/ui-logo.svg"}
                alt="ui-logo"
                height={"40px"}
                width={"40px"}
              />
              <div className="max-[635px]:hidden flex flex-col space-y-0">
                <h6 className="leading-4 text-md">Omni</h6>
                <h1 className="text-2xl font-bold leading-5">
                  <strong>Book</strong>
                </h1>
              </div>
            </NavLink>
            <div className="h-10 ">
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
                    className="pl-6 pr-12 block h-full max-w-80 text-sm border rounded-md bg-card border-border text-card-foreground focus:ring-0 focus:border-none outline-none"
                    placeholder="Search..."
                  />
                  <Button
                    type="submit"
                    variant={"icon"}
                    size={"icon"}
                    className="absolute top-0 right-1"
                  >
                    <SearchIcon />
                  </Button>
                </div>
              </form>
            </div>
          </div>
          {loaderData.user ? (
            <Profile user={loaderData.user} />
          ) : (
            <div className="ml-4">
              <Link
                to={"/login"}
                className="bg-primary text-primary-foreground shadow hover:bg-primary/90 inline-flex disabled:opacity-50inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 px-4 sm:px-8 py-4"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </nav>
      <Outlet />
    </AuthContext.Provider>
  );
};

export default memo(Navbar);
