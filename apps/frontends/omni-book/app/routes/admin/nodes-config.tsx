import type { Route } from "./+types/nodes-config";
import { parseCookie } from "~/server/utils";
import type { paths } from "~/lib/api-types";
import { env } from "~/lib/env";
import { NotAuthorized } from "~/components/not-authorized";
import PlusIcon from "~/components/icons/plus";
import { Button } from "~/components/ui/button";
import Popup from "~/components/ui/popup";
import TrashIcon from "~/components/icons/trash";
import { CertificateField } from "~/components/certificate-field";
import { TrustedLevelField } from "~/components/trusted-level-field";

type ProfileType =
  paths["/api/profile"]["get"]["responses"]["200"]["content"]["application/json"];

type NodeType =
  paths["/api/peer-nodes"]["get"]["responses"]["200"]["content"]["application/json"];

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

  const nodesResponse = await fetch(`${env.API_URL}/api/peer-nodes`, {
    method: "GET",
    credentials: "include",
    headers: {
      cookie: cookieHeader,
    },
  });

  if (!nodesResponse.ok) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const nodes = (await nodesResponse.json()) as NodeType;
  if (!nodes) {
    throw new Response("Unauthorized", { status: 401 });
  }

  return { user, nodes };
};

const NodesConfig = ({ loaderData }: Route.ComponentProps) => {
  const { nodes } = loaderData;
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
        {nodes &&
          nodes.length > 0 &&
          nodes.map((node) => (
            <tbody key={node._id}>
              <tr className="">
                <td className="w-[25%]">
                  <div
                    className={"bg-card-secondary rounded-lg pl-4 py-2 mr-5"}
                  >
                    {node.hostname}
                  </div>
                </td>
                <td className="w-[25%]">
                  <div
                    className={"bg-card-secondary rounded-lg pl-4 py-2 mr-5"}
                  >
                    {new Date(node.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </div>
                </td>
                <td className="w-[25%]">
                  <TrustedLevelField value={"Options"} />
                </td>
                <td className="w-[25%]">
                  <CertificateField value={"...kmdfkkl"} />
                </td>
                <td>
                  <Button
                    variant={"icon"}
                    size={"icon"}
                    className="bg-destructive"
                  >
                    <TrashIcon />
                  </Button>
                </td>
              </tr>
            </tbody>
          ))}
      </table>
    </div>
  );
};

export default NodesConfig;
