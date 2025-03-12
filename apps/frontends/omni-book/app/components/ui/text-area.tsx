import * as React from "react";

import { cn } from "~/lib/utils";

const TextArea = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }) => {
  return (
    <textarea
      className={cn(
        "block text-sm rounded-md bg-card  text-card-foreground focus:ring-0 focus:border-none outline-none",
        className
      )}
      {...props}
    />
  );
});

TextArea.displayName = "TextArea";

export { TextArea };
