import { cn } from "~/lib/utils";

type PopupProps = {
  content: string;
  children: React.ReactNode;
  bg?: string;
  textStyle?: string;
  className?: string;
  style?: React.CSSProperties;
};

const Popup: React.FC<PopupProps> = ({
  content,
  children,
  bg,
  textStyle,
  className,
  style,
}: PopupProps) => {
  return (
    <div className="relative group">
      {children}

      <div
        className={cn(
          "absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-56 rounded py-2 px-4",
          `bg-${bg ?? "card"}`,
          textStyle ?? "text-white text-xs",
          className
        )}
        style={style}
      >
        {content}
        <div
          className={`absolute left-1/2 border-t-${bg ?? "card"} -translate-x-1/2 top-full h-0 w-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent`}
        ></div>
      </div>
    </div>
  );
};

export default Popup;
