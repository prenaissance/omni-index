import { useFetcher } from "react-router";
import { useEffect, useState } from "react";
import PopupIcon from "./icons/popup-icon";
import RegenerateIcon from "./icons/regen";
import { Button } from "./ui/button";
import { Notification } from "./ui/notification";
import Tooltip from "./ui/tooltip";
import type { paths } from "~/lib/api-types";

type Node =
  paths["/api/peer-nodes"]["get"]["responses"]["200"]["content"]["application/json"];

type PinnedCertificate = Node[number]["pinnedCertificates"][number];

type CertificateFieldProps = {
  certificate: PinnedCertificate;
  nodeId: string;
};

export const CertificateField = ({
  certificate,
  nodeId,
}: CertificateFieldProps) => {
  const fetcher = useFetcher();
  const [notification, setNotification] = useState(false);

  useEffect(() => {
    if (fetcher.data) {
      setNotification(true);
    }
  }, [fetcher.data]);

  return (
    <>
      <div
        className={
          "bg-card-secondary rounded-lg pl-4 pr-2 py-1 mr-5 flex items-center justify-between"
        }
      >
        <div className="flex items-center gap-x-2">
          <p>{"..." + certificate?.sha256?.slice(-8)}</p>
          <Tooltip
            variant={"dark"}
            content={certificate?.sha256 ?? "certificate"}
            className="w-96"
            style={{ zIndex: 1000 }}
          >
            <PopupIcon className="w-5 h-5" />
          </Tooltip>
        </div>
        <div>
          <Tooltip
            variant={"light"}
            content={"Regenerate certificate"}
            className="w-fit whitespace-nowrap"
            style={{ zIndex: 1000 }}
          >
            <fetcher.Form
              action={`/api/peer-nodes/${nodeId}/refresh`}
              method="POST"
            >
              <Button
                variant={"icon"}
                size={"icon"}
                className="m-0 p-0 w-fit h-fit"
              >
                {fetcher.state === "submitting" ? (
                  <div className="bg-accent p-2 rounded-md">
                    <div className="animate-spin">
                      <RegenerateIcon size={4} />
                    </div>
                  </div>
                ) : (
                  <div
                    className={
                      "m-0 p-2 w-fit h-fit rounded-md hover:bg-accent transition-colors duration-200"
                    }
                  >
                    <RegenerateIcon size={4} />
                  </div>
                )}
              </Button>
            </fetcher.Form>
          </Tooltip>
        </div>
      </div>
      {notification && (
        <div className="fixed z-50 bottom-0 right-0 m-10">
          <Notification
            variant={
              fetcher.data?.error
                ? "danger"
                : fetcher.data?.success
                  ? "success"
                  : "default"
            }
            closeButton
            onClose={() => {
              setNotification(false);
            }}
          >
            {"error" in fetcher.data
              ? fetcher.data?.error
              : fetcher.data?.success
                ? "Certificate regenerated"
                : null}
          </Notification>
        </div>
      )}
    </>
  );
};
