import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Link } from "react-router";
import CheckIcon from "../icons/check";
import ExclamationIcon from "../icons/exclamation";
import WarningIcon from "../icons/warning";
import InfoIcon from "../icons/info";
import CloseIcon from "../icons/close";
import { Button } from "./button";
import { cn } from "~/lib/utils";

const notificationVariants = cva(
  "w-full flex items-center gap-2 rounded-md py-2 px-3 text-sm font-semibold justify-between",
  {
    variants: {
      variant: {
        default: "bg-[#0e9ce5]",
        success: "bg-[#50c895]",
        danger: "bg-red-500",
        warning: "bg-[#ffb546]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

type BaseProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof notificationVariants>;

type NoClose = {
  onClose?: undefined;
  closeButtonLink?: undefined;
};

type WithOnClose = {
  onClose: () => void;
  closeButtonLink?: never;
};

type WithCloseLink = {
  onClose?: never;
  closeButtonLink: string;
};

export type NotificationProps = BaseProps &
  (NoClose | WithOnClose | WithCloseLink);

const Notification = React.forwardRef<HTMLDivElement, NotificationProps>(
  (
    { className, variant = "default", onClose, closeButtonLink, ...props },
    ref
  ) => {
    const Comp = "div";

    const iconMap = {
      success: <CheckIcon />,
      danger: <ExclamationIcon />,
      warning: <WarningIcon />,
      default: <InfoIcon />,
    };

    return (
      <Comp
        className={cn(notificationVariants({ variant, className }))}
        ref={ref}
        {...props}
      >
        <div className="flex items-center gap-2">
          <div>{iconMap[variant ?? "default"]}</div>
          <div className="flex flex-col gap-2">{props.children}</div>
        </div>
        {onClose && (
          <Button
            variant={"icon"}
            size="icon"
            onClick={onClose}
            className="p-0 m-0 w-fit h-fit"
          >
            <CloseIcon size={4} />
          </Button>
        )}
        {closeButtonLink && (
          <Link to={closeButtonLink} className="text-sm">
            <CloseIcon size={4} />
          </Link>
        )}
      </Comp>
    );
  }
);

Notification.displayName = "Notification";
export { Notification, notificationVariants };
