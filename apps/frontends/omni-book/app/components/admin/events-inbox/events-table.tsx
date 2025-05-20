import StatusDropdown from "./status-dropdown";
import type { paths } from "~/lib/api-types";

type EventsResponse =
  paths["/api/events"]["get"]["responses"]["200"]["content"]["application/json"];

type EventsTableProps = {
  events: EventsResponse["events"];
};

const EventsTable = ({ events }: EventsTableProps) => {
  return (
    <div
      className={`h-[calc(100vh-280px)] pr-4 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-card-secondary [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-lg [&::-webkit-scrollbar:horizontal]:h-1
  [&::-webkit-scrollbar:vertical]:w-1 [&::-webkit-scrollbar-corner]:bg-transparent`}
    >
      <table className="w-full">
        <thead className="sticky top-0 bg-card z-10 border-b-2 border-card-secondary h-14">
          <tr className="text-lg font-medium text-accent border-collapse">
            <th className="text-left">Created At</th>
            <th className="text-left">Type</th>
            <th className="text-left">Node URL</th>
            <th className="text-left">
              <StatusDropdown />
            </th>
            <th className="text-left">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y-2 divide-card-secondary ">
          {events.map((event) => (
            <tr
              key={event._id}
              className="text-sm text-foreground/70 transition-colors duration-200 ease-in-out"
            >
              <td className="py-4">
                {new Date(event.createdAt).toLocaleString()}
              </td>
              <td>{event.type}</td>
              <td>{event.nodeUrl}</td>
              <td
                className={
                  event.status === "pending"
                    ? "text-warning"
                    : event.status === "rejected"
                      ? "text-error"
                      : event.status === "accepted"
                        ? "text-success"
                        : "text-foreground/70"
                }
              >
                <div
                  className={`${
                    event.status === "pending"
                      ? "border-warning"
                      : event.status === "rejected"
                        ? "border-error"
                        : event.status === "accepted"
                          ? "border-success"
                          : "border-foreground/70"
                  } border-1 w-fit rounded-full px-3 py-1`}
                >
                  {event.status}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EventsTable;
