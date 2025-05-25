import StatusDropdown from "./status-dropdown";
import ChangeStatusForm from "./change-status-form";
import EntryPayload from "./entry-playload";
import { EditIcon } from "~/components/icons";
import MoreIcon from "~/components/icons/more";
import Confirmation from "~/components/ui/confirmation";
import type { components, paths } from "~/lib/api-types";
import { formatEventType } from "~/server/utils";

type Entry = components["schemas"]["Entry"];
type EntryEdit = components["schemas"]["UpdateEntryRequest"];
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
        <thead className="sticky top-0 bg-card z-10 border-b-2 border-card-secondary h-14 ">
          <tr className="text-lg font-medium text-accent border-collapse">
            <th className="text-left min-w-44">Created At</th>
            <th className="text-left min-w-32">Type</th>
            <th className="text-left min-w-72">Node URL</th>
            <th className="text-left min-w-52">Info</th>
            <th className="text-left pl-4">
              <StatusDropdown />
            </th>
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
              <td>{formatEventType(event.type)}</td>
              <td>{event.nodeUrl || "https://node1.omni-index.com"}</td>
              <td>
                <div className="flex items-center gap-x-4">
                  <p className="truncate  font-family-montserrat">
                    {event.type === "entry.created" ? (
                      <p>
                        {(event.payload as { entry: Entry }).entry.title} -{" "}
                        {(event.payload as { entry: Entry }).entry.author}
                      </p>
                    ) : (
                      <p>
                        id: {(event.payload as { entryId: string }).entryId}
                      </p>
                    )}
                  </p>
                  {event.type !== "entry.deleted" ? (
                    <div>
                      <input
                        type="checkbox"
                        id={`view-payload-${event._id}`}
                        className="peer hidden"
                      />
                      <label
                        htmlFor={`view-payload-${event._id}`}
                        className="cursor-pointer flex items-center gap-4"
                      >
                        <div className="hover:text-primary transition-colors duration-200 ease-in-out">
                          <MoreIcon />
                        </div>
                      </label>
                      <div className="hidden peer-checked:block">
                        <Confirmation
                          description={
                            event.type === "entry.created" ? (
                              <EntryPayload
                                payload={
                                  (
                                    event.payload as {
                                      entry: Entry;
                                    }
                                  ).entry
                                }
                              />
                            ) : event.type === "entry.updated" ? (
                              <EntryPayload
                                payload={
                                  (
                                    event.payload as {
                                      fields: EntryEdit;
                                    }
                                  ).fields
                                }
                              />
                            ) : (
                              JSON.stringify(event.payload, null, 2)
                            )
                          }
                          title={
                            event.type === "entry.created"
                              ? "Added Info"
                              : event.type === "entry.updated"
                                ? "Updated Info"
                                : "Payload"
                          }
                          htmlFor={`view-payload-${event._id}`}
                          className="w-[80%] md:w-[50%] lg:w-[40%] xl:w-[30%]"
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              </td>
              <td
                className={`${
                  event.status === "pending"
                    ? "text-warning"
                    : event.status === "rejected"
                      ? "text-error"
                      : event.status === "accepted"
                        ? "text-success"
                        : "text-foreground/70"
                } pl-4`}
              >
                <div className="flex items-center gap-x-2 justify-between w-32">
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
                  <div>
                    <input
                      type="checkbox"
                      id={`update-status-${event._id}`}
                      className="peer hidden"
                    />
                    <label
                      htmlFor={`update-status-${event._id}`}
                      className="cursor-pointer flex items-center gap-4"
                    >
                      <div className="hover:text-primary transition-colors duration-200 ease-in-out">
                        <EditIcon size={5} />
                      </div>
                    </label>
                    <div className="hidden peer-checked:block">
                      <Confirmation
                        title="Change update status"
                        confirmButtonText="Update"
                        htmlFor={`update-status-${event._id}`}
                        className="xl:w-[30%] lg:w-[40%] text-white"
                        closeIcon={false}
                      >
                        <ChangeStatusForm
                          eventId={event._id}
                        ></ChangeStatusForm>
                      </Confirmation>
                    </div>
                  </div>
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
