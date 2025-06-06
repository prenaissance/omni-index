import { useEffect, useState } from "react";
import { Form, useSearchParams, useSubmit } from "react-router";
import { FilterIcon } from "~/components/icons";
import { Button } from "~/components/ui/button";

const STATUSES = ["pending", "accepted", "rejected"] as const;

const StatusDropdown = () => {
  const [pageLoaded, setPageLoaded] = useState(false);
  const [searchParams] = useSearchParams();
  const submit = useSubmit();

  const currentStatuses = searchParams.getAll("statuses");

  const handleCheckboxChange = (status: string, checked: boolean) => {
    const currentStatuses = searchParams.getAll("statuses");
    const updatedStatuses = checked
      ? [...currentStatuses, status]
      : currentStatuses.filter((s) => s !== status);

    const newParams = new URLSearchParams();
    updatedStatuses.forEach((s) => newParams.append("statuses", s));

    submit(newParams, { method: "get" });
  };

  useEffect(() => {
    setPageLoaded(true);
  }, []);

  return (
    <details className="relative w-full group">
      <summary className="list-none cursor-pointer flex items-center gap-x-3 group-open:text-primary">
        <span>Status</span>
        <div className="p-1 border rounded hover:cursor-pointer hover:text-primary transition-colors duration-200 ease-in-out w-fit">
          <FilterIcon size={4}></FilterIcon>
        </div>
      </summary>
      <div className="absolute left-0 z-10 mt-2 rounded-md bg-card-secondary shadow-lg">
        <Form method="get" className="flex flex-col p-3">
          {Array.from(searchParams.entries())
            .filter(([key]) => key !== "statuses")
            .map(([key, value]) => (
              <input
                key={`${key}-${value}`}
                type="hidden"
                name={key}
                value={value}
              />
            ))}
          {STATUSES.map((status) => (
            <label
              key={status}
              className="inline-flex items-center space-x-2 py-1"
            >
              <input
                type="checkbox"
                name="statuses"
                value={status}
                defaultChecked={currentStatuses.includes(status)}
                onChange={(e) => handleCheckboxChange(status, e.target.checked)}
                className="text-primary rounded-sm accent-primary"
              />
              <span className="font-light text-sm text-primary">{status}</span>
            </label>
          ))}
          {!pageLoaded && (
            <Button
              type="submit"
              variant="outline"
              className="py-1 h-fit w-fit text-xs mt-2"
            >
              Apply
            </Button>
          )}
        </Form>
      </div>
    </details>
  );
};

export default StatusDropdown;
