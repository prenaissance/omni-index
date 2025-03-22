import { Link, Outlet, Form } from "react-router";
import type { Route } from "../components/+types/navbar";
import { Button } from "./ui/button";
import type { paths } from "~/lib/api-types";
import { env } from "~/lib/env";
import { parseCookie } from "~/server/utils";

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

  const res = await fetch(`${env.VITE_API_URL}/api/profile`, {
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
    <>
      <nav className="sticky top-0 bg-background">
        <div className="py-5 px-10 flex flex-row items-center justify-between">
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
          {loaderData.user ? (
            <div className="flex flex-row space-x-4 items-center">
              <div className="relative inline-block">
                <input
                  type="checkbox"
                  id="menu-toggle"
                  className="peer hidden"
                />
                <label
                  htmlFor="menu-toggle"
                  className="cursor-pointer flex items-center gap-4"
                >
                  <img
                    src={loaderData.user.avatarUrl}
                    alt="avatar"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h6 className="text-sm font-medium text-foreground">
                      {loaderData.user.displayName}
                    </h6>
                  </div>
                </label>
                <div
                  className="absolute right-[-20px] mt-2 w-36 rounded-md shadow-lg bg-card border border-card
                     opacity-0 scale-95 peer-checked:opacity-100 peer-checked:scale-100 transition-all"
                >
                  <ul className="py-2 font-medium text-sm">
                    <li>
                      <a href="#" className="block px-4 py-2 hover:bg-popover">
                        Profile
                      </a>
                    </li>
                    <li>
                      <a href="#" className="block px-4 py-2 hover:bg-popover">
                        Settings
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="px-4 py-2 hover:bg-popover flex items-center gap-2"
                      >
                        Logout
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="size-5 transform scale-x-[-1]"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.5 3.75a1.5 1.5 0 0 1 1.5 1.5v13.5a1.5 1.5 0 0 1-1.5 1.5h-6a1.5 1.5 0 0 1-1.5-1.5V15a.75.75 0 0 0-1.5 0v3.75a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5.25a3 3 0 0 0-3-3h-6a3 3 0 0 0-3 3V9A.75.75 0 1 0 9 9V5.25a1.5 1.5 0 0 1 1.5-1.5h6ZM5.78 8.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 0 0 0 1.06l3 3a.75.75 0 0 0 1.06-1.06l-1.72-1.72H15a.75.75 0 0 0 0-1.5H4.06l1.72-1.72a.75.75 0 0 0 0-1.06Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <Link
                to={"/login"}
                className="bg-primary text-primary-foreground shadow hover:bg-primary/90 inline-flex disabled:opacity-50inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 px-8 py-4"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </nav>
      <Outlet />
    </>
  );
};

export default Navbar;
