import { type TextareaHTMLAttributes } from "react";

import { cn } from "~/lib/utils";

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

const TextArea = ({ className, ...props }: TextAreaProps) => {
  return (
    <textarea
      className={cn(
        "block text-sm rounded-md bg-card  text-card-foreground focus:ring-0 focus:border-none outline-none [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-card-secondary [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-lg [&::-webkit-scrollbar:horizontal]:h-1 [&::-webkit-scrollbar:vertical]:w-1 [&::-webkit-scrollbar-corner]:bg-transparent",
        className
      )}
      {...props}
    />
  );
};

export { TextArea };
