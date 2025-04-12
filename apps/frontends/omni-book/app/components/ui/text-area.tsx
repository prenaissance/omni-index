import { type TextareaHTMLAttributes } from "react";

import { cn } from "~/lib/utils";

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

const TextArea = ({ className, ...props }: TextAreaProps) => {
  return (
    <textarea
      className={cn(
        "block text-sm rounded-md bg-card  text-card-foreground focus:ring-0 focus:border-none outline-none",
        className
      )}
      {...props}
    />
  );
};

export { TextArea };
