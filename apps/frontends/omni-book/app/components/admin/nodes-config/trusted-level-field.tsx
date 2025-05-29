import { useEffect, useState } from "react";
import { useFetcher, useSearchParams } from "react-router";
import { ChevronIcon } from "~/components/icons";
import { Notification } from "~/components/ui/notification";

type TrustedLevelFieldProps = {
  value: string;
  nodeId: string;
};

export const TrustedLevelField = ({
  value,
  nodeId,
}: TrustedLevelFieldProps) => {
  const fetcher = useFetcher();

  const [notification, setNotification] = useState(false);

  useEffect(() => {
    if (fetcher.data) {
      setNotification(true);
    }
  }, [fetcher.data]);

  const [searchParams] = useSearchParams();

  const errorMessage = searchParams.get("error");
  const successMessage = searchParams.get("success");

  return (
    <>
      <details className="relative inline-block text-left w-full mr-5 group">
        <summary className="list-none cursor-pointer flex justify-between items-center gap-x-1.5 bg-card-secondary rounded-lg px-4 py-2 mr-5 hover:bg-accent group-open:bg-accent">
          <div>{value}</div>
          <ChevronIcon direction="down" size={4} />
        </summary>

        <div className="absolute left-0 right-5 z-10 mt-2 max-w-full origin-top-right rounded-md bg-background shadow-lg ">
          <div className="py-1">
            <fetcher.Form action={`/api/peer-nodes/${nodeId}`} method="PATCH">
              <button
                type="submit"
                className="block w-full px-4 py-2 text-left text-sm hover:bg-accent"
                name="trustLevel"
                value="trusted"
              >
                trusted
              </button>
            </fetcher.Form>
          </div>
          <div className="py-1">
            <fetcher.Form action={`/api/peer-nodes/${nodeId}`} method="PATCH">
              <button
                type="submit"
                className="block w-full px-4 py-2 text-left text-sm hover:bg-accent"
                name="trustLevel"
                value="semi-trusted"
              >
                semi-trusted
              </button>
            </fetcher.Form>
          </div>
        </div>
      </details>
      {notification ? (
        <div className="fixed z-50 bottom-4 right-4 m-10">
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
                ? "Trust level updated successfully"
                : null}
          </Notification>
        </div>
      ) : errorMessage ? (
        <div className="fixed z-50 bottom-4 right-4 m-10">
          <Notification
            variant={"danger"}
            closeButtonLink={"/admin/nodes-config"}
          >
            {errorMessage}
          </Notification>
        </div>
      ) : successMessage ? (
        <div className="fixed z-50 bottom-4 right-4 m-10">
          <Notification
            variant={"success"}
            closeButtonLink={"/admin/nodes-config"}
          >
            {successMessage}
          </Notification>
        </div>
      ) : null}
    </>
  );
};
