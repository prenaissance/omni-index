import { Form, type HTMLFormMethod } from "react-router";
import { CloseIcon } from "../icons";
import { Button } from "./button";

type ConfirmationProps = {
  title: string;
  description?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  htmlFor: string;
  action?: string;
  method?: HTMLFormMethod;
  children?: React.ReactNode;
  className?: string;
  onClose?: () => void;
  closeIcon?: boolean;
};

const Confirmation = ({
  title,
  description,
  confirmButtonText,
  cancelButtonText,
  htmlFor,
  action,
  method,
  children,
  className,
  onClose,
  closeIcon = true,
}: ConfirmationProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`bg-card rounded-lg shadow-lg p-6 w-96 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          {closeIcon && (
            <label
              htmlFor={htmlFor}
              onClick={() => {
                if (typeof onClose === "function") {
                  onClose();
                }
              }}
              className="cursor-pointer px-2 py-2 rounded-full border border-border text-sm hover:bg-muted transition"
            >
              <CloseIcon size={4} />
            </label>
          )}
        </div>
        <p className="mt-2 text-sm text-foreground">{description}</p>
        {children}
        {action && (
          <div className="mt-4 flex justify-end gap-2">
            <Form action={action} method={method ?? "POST"}>
              <Button type="submit" variant="destructive">
                {confirmButtonText || "Confirm"}
              </Button>
            </Form>
            {cancelButtonText && (
              <label
                htmlFor={htmlFor}
                onClick={() => {
                  if (typeof onClose === "function") {
                    onClose();
                  }
                }}
                className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-8 py-4"
              >
                {cancelButtonText}
              </label>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Confirmation;
