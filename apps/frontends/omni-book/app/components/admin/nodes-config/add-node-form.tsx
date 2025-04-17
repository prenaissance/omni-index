import { useFetcher } from "react-router";
import { useEffect, useState } from "react";
import { nodeSchema, type NodeFormData } from "~/schemas/node-schema";
import { Notification } from "~/components/ui/notification";
import { Button } from "~/components/ui/button";
import { SpinnerIcon } from "~/components/icons";

export const AddNodeForm = () => {
  const [formData, setFormData] = useState({ url: "" });
  const [errors, setErrors] = useState<
    Partial<Record<keyof NodeFormData, string[]>>
  >({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);

    const result = nodeSchema.safeParse(updated);
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
    } else {
      setErrors({});
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const result = nodeSchema.safeParse(formData);
    if (!result.success) {
      e.preventDefault();
      setErrors(result.error.flatten().fieldErrors);
    }
  };

  const fetcher = useFetcher();
  const [notification, setNotification] = useState(false);

  useEffect(() => {
    if (fetcher.data) {
      setNotification(true);
    }
  }, [fetcher.data]);

  return (
    <div className="flex flex-col">
      {notification && (
        <div>
          <Notification
            variant={
              fetcher.data?.error
                ? "danger"
                : fetcher.data?.success
                  ? "success"
                  : "default"
            }
            onClose={() => {
              setNotification(false);
            }}
          >
            {"error" in fetcher.data
              ? fetcher.data?.error
              : fetcher.data?.success
                ? "Node added successfully"
                : null}
          </Notification>
        </div>
      )}
      <fetcher.Form
        action="/api/peer-nodes"
        method="POST"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-2 my-4">
          <label className="flex flex-col items-end gap-1 w-full">
            <div className="flex items-center gap-4 justify-between w-full text-sm border-none">
              <p>Hostname</p>
              <input
                name="url"
                type="text"
                className="px-4 py-2 w-2/3 bg-card-secondary rounded-lg outline-none"
                placeholder="google.com"
                onChange={handleChange}
                defaultValue={formData.url}
                required
              />
            </div>
            {errors.url ? (
              <p className="text-red-500 text-xs">
                {errors.url.map((error) => (
                  <span key={error}>{error}</span>
                ))}
              </p>
            ) : null}
          </label>
          <label className="flex items-center gap-4 justify-between w-full text-sm">
            <p>Trusted Level</p>
            <select
              name="trustLevel"
              className="px-4 border-r-8 border-r-transparent py-2 w-2/3 bg-card-secondary rounded-lg outline-none"
              defaultValue="trusted"
            >
              <option value="trusted" className="hover:bg-black">
                trusted
              </option>
              <option value="semi-trusted">semi-trusted</option>
            </select>
          </label>
        </div>
        <div className="flex gap-2 w-full justify-end">
          <label
            htmlFor={"add-node-button"}
            onClick={() => {
              setErrors({});
              setNotification(false);
            }}
            className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-primary text-primary bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-10 px-8 py-4"
          >
            Cancel
          </label>
          <Button
            type="submit"
            className="w-28"
            disabled={fetcher.state === "submitting"}
          >
            {fetcher.state === "submitting" ? <SpinnerIcon /> : "Submit"}
          </Button>
        </div>
      </fetcher.Form>
    </div>
  );
};
