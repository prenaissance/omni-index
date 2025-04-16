import type { Route } from "./+types/nodes-config";
import { parseCookie } from "~/server/utils";
import type { paths } from "~/lib/api-types";
import { env } from "~/lib/env";
import { NotAuthorized } from "~/components/not-authorized";
import PlusIcon from "~/components/icons/plus";
import TrashIcon from "~/components/icons/trash";
import { CertificateField } from "~/components/certificate-field";
import { TrustedLevelField } from "~/components/trusted-level-field";
import Confirmation from "~/components/ui/confirmation";
import { AddNodeForm } from "~/components/add-node-form";
import Tooltip from "~/components/ui/tooltip";

type Profile =
  paths["/api/profile"]["get"]["responses"]["200"]["content"]["application/json"];

type Node =
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

  const user = (await res.json()) as Profile;

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

  const nodes = (await nodesResponse.json()) as Node;
  if (!nodes) {
    throw new Response("Unauthorized", { status: 401 });
  }

  return { user, nodes };
};

export default function NodesConfig({ loaderData }: Route.ComponentProps) {
  const { nodes } = loaderData;

  return !loaderData ? (
    <NotAuthorized />
  ) : (
    <div className="m-10 rounded-lg bg-card pl-10 pr-6 py-5">
      <div className="flex items-center justify-between mb-2 pr-4">
        <h1 className="text-2xl font-bold">Nodes Configuration</h1>
        <Tooltip
          variant="light"
          content={"Add a node"}
          className="w-fit whitespace-nowrap"
        >
          <div>
            <input
              type="checkbox"
              id={"add-node-button"}
              className="peer hidden"
            />
            <label
              htmlFor={"add-node-button"}
              className="cursor-pointer flex items-center gap-4"
            >
              <PlusIcon size={8} />
            </label>
            <div className="hidden peer-checked:block">
              <Confirmation
                title="Add a peer node"
                confirmButtonText="Delete"
                htmlFor={"add-node-button"}
                className="xl:w-[30%] lg:w-[40%]"
                closeIcon={false}
              >
                <AddNodeForm />
              </Confirmation>
            </div>
          </div>
        </Tooltip>
      </div>
      <div
        className={`h-[calc(100vh-240px)] pr-4 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-card-secondary [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-lg`}
      >
        <table className="w-full">
          <thead className="sticky top-0 bg-card z-10">
            <tr className="text-md font-medium text-accent border-collapse">
              <th className="text-left">Hostname</th>
              <th className="text-left">Created At</th>
              <th className="text-left">Trust Level</th>
              <th className="text-left">Certificate</th>
              <th className="text-left"></th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-card-secondary">
            {nodes &&
              nodes.length > 0 &&
              nodes.map((node) => (
                <tr className="h-16" key={node._id}>
                  <td className="w-[25%]">
                    <div
                      className={"bg-card-secondary rounded-lg pl-4 py-2 mr-5"}
                    >
                      {node.url}
                    </div>
                  </td>
                  <td className="w-[25%]">
                    <div
                      className={"bg-card-secondary rounded-lg pl-4 py-2 mr-5"}
                    >
                      {new Date(node.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "2-digit",
                      })}
                    </div>
                  </td>
                  <td className="w-[25%]">
                    <TrustedLevelField value={"Options"} />
                  </td>
                  <td className="w-[25%]">
                    <CertificateField
                      certificate={
                        node.pinnedCertificates[
                          node.pinnedCertificates?.length - 1
                        ]
                      }
                      nodeId={node._id}
                    />
                  </td>
                  <td>
                    <div>
                      <input
                        type="checkbox"
                        id={`delete-node-${node._id}`}
                        className="peer hidden"
                      />
                      <label
                        htmlFor={`delete-node-${node._id}`}
                        className="cursor-pointer flex items-center gap-4"
                      >
                        <div className="text-white text-primary-foreground flex items-center justify-center h-10 w-10 p-1 bg-destructive rounded-md hover:bg-destructive/80 transition-colors">
                          <TrashIcon />
                        </div>
                      </label>
                      <div className="hidden peer-checked:block">
                        <Confirmation
                          description="Are you sure you want to delete this node?"
                          title="Delete node"
                          confirmButtonText="Delete"
                          cancelButtonText="Cancel"
                          action={`/api/peer-nodes/${node._id}/remove`}
                          htmlFor={`delete-node-${node._id}`}
                          method="DELETE"
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
