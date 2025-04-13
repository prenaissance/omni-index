import type { Route } from "./+types/nodes-config";
import { parseCookie } from "~/server/utils";
import type { paths } from "~/lib/api-types";
import { env } from "~/lib/env";
import { NotAuthorized } from "~/components/not-authorized";
import PlusIcon from "~/components/icons/plus";
import { Button } from "~/components/ui/button";
import Popup from "~/components/ui/popup";
import TrashIcon from "~/components/icons/trash";
import ChevronIcon from "~/components/icons/chevron";
import RegenerateIcon from "~/components/icons/regen";
import PopupIcon from "~/components/icons/popup-icon";

type ProfileType =
  paths["/api/profile"]["get"]["responses"]["200"]["content"]["application/json"];

export const loader = async ({ request }: Route.LoaderArgs) => {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const parsedCookie = parseCookie(cookieHeader);
  if (!parsedCookie.session) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const res = await fetch(`${env.API_URL}/api/profile`, {
    method: "GET",
    credentials: "include",
    headers: {
      cookie: cookieHeader,
    },
  });

  if (!res.ok) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const user = (await res.json()) as ProfileType;

  if (user.role !== "admin" && user.role !== "owner") {
    throw new Response("Forbidden", { status: 403 });
  }

  return { user };
};

const NodesConfig = ({ loaderData }: Route.ComponentProps) => {
  return !loaderData ? (
    <NotAuthorized />
  ) : (
    <div className="m-10 rounded-lg bg-card px-10 py-5">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">Nodes Configuration</h1>
        <Popup content={"Add a node"} className="w-32" bg={"accent"}>
          <Button variant={"icon"} size={"icon"}>
            <PlusIcon size={7} />
          </Button>
        </Popup>
      </div>
      <table className="w-full table-auto">
        <thead>
          <tr className="text-md font-medium text-accent">
            <th className="text-left">Hostname</th>
            <th className="text-left">Created At</th>
            <th className="text-left">Trust Level</th>
            <th className="text-left">Certificate</th>
            <th className="text-left"></th>
          </tr>
        </thead>
        <tbody>
          {/* Add rows here */}
          <tr className="">
            <td className="w-[25%]">
              <div className={"bg-card-secondary rounded-lg pl-4 py-2 mr-5"}>
                Node 1
              </div>
            </td>
            <td className="w-[25%]">
              <div className={"bg-card-secondary rounded-lg pl-4 py-2 mr-5"}>
                31 March 2025
              </div>
            </td>
            <td className="w-[25%]">
              <details className="relative inline-block text-left w-full mr-5 group">
                <summary className="list-none cursor-pointer flex justify-between items-center gap-x-1.5 bg-card-secondary rounded-lg px-4 py-2 mr-5 hover:bg-accent group-open:bg-accent">
                  <div>Options</div>
                  <ChevronIcon direction="down" size={4} />
                </summary>

                <div className="absolute left-0 right-5 z-10 mt-2 max-w-full origin-top-right rounded-md bg-card-secondary shadow-lg ">
                  <div className="py-1">
                    <form action="#" method="POST">
                      <button
                        type="submit"
                        className="block w-full px-4 py-2 text-left text-sm hover:bg-accent"
                      >
                        Trusted
                      </button>
                    </form>
                  </div>
                  <div className="py-1">
                    <form action="#" method="POST">
                      <button
                        type="submit"
                        className="block w-full px-4 py-2 text-left text-sm hover:bg-accent"
                      >
                        Semi-trusted
                      </button>
                    </form>
                  </div>
                  <div className="py-1">
                    <form action="#" method="POST">
                      <button
                        type="submit"
                        className="block w-full px-4 py-2 text-left text-sm hover:bg-accent"
                      >
                        Untrusted
                      </button>
                    </form>
                  </div>
                </div>
              </details>
            </td>
            <td className="w-[25%]">
              <div
                className={
                  "bg-card-secondary rounded-lg pl-4 pr-2 py-1 mr-5 flex items-center justify-between"
                }
              >
                <div className="flex items-center gap-x-2">
                  <p>...kfkfkf</p>
                  <Popup content={"full certificate"}>
                    <PopupIcon className="w-5 h-5" />
                  </Popup>
                </div>
                <div className="">
                  <Popup
                    content={"Regenerate certificate"}
                    className="w-32"
                    bg={"accent"}
                  >
                    <Button
                      variant={"icon"}
                      size={"icon"}
                      className="m-0 p-2 w-fit h-fit hover:bg-accent"
                    >
                      <RegenerateIcon size={4} />
                    </Button>
                  </Popup>
                </div>
              </div>
            </td>
            <td>
              <Button variant={"icon"} size={"icon"} className="bg-destructive">
                <TrashIcon />
              </Button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default NodesConfig;
