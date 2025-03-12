import PopupIcon from "../icons/popup-icon";

type PopupProps = {
  content: string;
};

const Popup: React.FC<PopupProps> = ({ content }: PopupProps) => {
  return (
    <div className="relative group h-7">
      <button className="p-0">
        <PopupIcon />
      </button>

      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-52 bg-card text-white text-xs rounded py-2 px-4">
        {content}
        <div className="absolute left-1/2 -translate-x-1/2 top-full h-0 w-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-card"></div>
      </div>
    </div>
  );
};

export default Popup;
