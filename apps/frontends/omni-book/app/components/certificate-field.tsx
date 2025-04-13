import PopupIcon from "./icons/popup-icon";
import RegenerateIcon from "./icons/regen";
import { Button } from "./ui/button";
import Popup from "./ui/popup";

type CertificateFieldProps = {
  value: string;
};

export const CertificateField = ({ value }: CertificateFieldProps) => {
  return (
    <div
      className={
        "bg-card-secondary rounded-lg pl-4 pr-2 py-1 mr-5 flex items-center justify-between"
      }
    >
      <div className="flex items-center gap-x-2">
        <p>{value}</p>
        <Popup content={"full certificate"}>
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
