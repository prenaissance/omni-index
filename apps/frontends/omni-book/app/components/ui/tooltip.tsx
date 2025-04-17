import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const tooltipVariants = cva(
  "absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-56 rounded py-2 px-4 text-xs z-10000",
  {
    variants: {
      variant: {
        default: "bg-card",
        light: "bg-accent text-foreground",
        dark: "bg-background text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const tooltipArrowVariants = cva(
  "absolute left-1/2 -translate-x-1/2 top-full h-0 w-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent",
  {
    variants: {
      variant: {
        default: "border-t-card",
        light: "border-t-accent",
        dark: "border-t-background",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface TooltipProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tooltipVariants> {
  content: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({ content, children, className, variant, style, ...props }, ref) => {
    return (
      <div className="relative group">
        {children}
        <div
          id="tooltip-default"
          role="tooltip"
          className={tooltipVariants({ variant, className })}
          ref={ref}
          {...props}
          style={style}
        >
          {content}
          <div className={tooltipArrowVariants({ variant })}></div>
        </div>
      </div>
    );
  }
);

Tooltip.displayName = "Tooltip";
export default Tooltip;
