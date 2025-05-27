import { useFetcher } from "react-router";
import { SpinnerIcon } from "~/components/icons";
import { Button } from "~/components/ui/button";

type ChangeStatusFormProps = {
  eventId: string;
  fetcher: ReturnType<typeof useFetcher>;
};

const ChangeStatusForm = ({ eventId, fetcher }: ChangeStatusFormProps) => {
  return (
    <fetcher.Form action={`/api/events/${eventId}/status`} method="PATCH">
      <div className="flex flex-col gap-2 my-4">
        <label className="flex items-center gap-4 justify-between w-full text-sm">
          <p>Status</p>
          <select
            name="status"
            className="px-4 border-r-8 border-r-transparent py-2 w-2/3 bg-card-secondary rounded-lg outline-none"
            defaultValue="accepted"
          >
            <option value="accepted">accepted</option>
            <option value="rejected">rejected</option>
          </select>
        </label>
      </div>
      <div className="flex gap-2 w-full justify-end">
        <label
          htmlFor={`update-status-${eventId}`}
          className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-primary text-primary bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-10 px-8 py-4"
        >
          Cancel
        </label>
        <Button
          type="submit"
          className="w-28"
          disabled={fetcher.state === "submitting"}
          onClick={() => {
            const checkbox = document.getElementById(
              `update-status-${eventId}`
            ) as HTMLInputElement | null;
            if (checkbox) {
              checkbox.checked = false;
            }
          }}
        >
          {fetcher.state === "submitting" ? <SpinnerIcon /> : "Submit"}
        </Button>
      </div>
    </fetcher.Form>
  );
};

export default ChangeStatusForm;
