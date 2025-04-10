type ChevronIconProps = {
  direction: "up" | "down" | "left" | "right";
  size?: number;
};

const ChevronIcon = ({ direction, size }: ChevronIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`w-${size ?? 6} h-${size ?? 6} transform ${direction === "up" ? "rotate-180" : direction === "down" ? "" : direction === "left" ? "rotate-90" : direction === "right" ? "-rotate-90" : ""}`}
    >
      <path
        fillRule="evenodd"
        d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
};

export default ChevronIcon;
