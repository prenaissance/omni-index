import PopupIcon from "./icons/popup-icon";
import RegenerateIcon from "./icons/regen";
import { Button } from "./ui/button";
import Popup from "./ui/popup";
import type { paths } from "~/lib/api-types";

type Node =
  paths["/api/peer-nodes"]["get"]["responses"]["200"]["content"]["application/json"];

type PinnedCertificate = Node[number]["pinnedCertificates"][number];

type CertificateFieldProps = {
  certificate: PinnedCertificate;
};

export const CertificateField = ({ certificate }: CertificateFieldProps) => {
  return (
    <div
      className={
        "bg-card-secondary rounded-lg pl-4 pr-2 py-1 mr-5 flex items-center justify-between"
      }
    >
      <div className="flex items-center gap-x-2">
        <p>{"..." + certificate?.sha256?.slice(-8)}</p>
        <Popup
          content={certificate?.sha256 ?? "nothing"}
          className="w-40 break-all"
        >
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
  );
};
