type MinusIconProps = {
  size?: number;
};

const MinusIcon = ({ size }: MinusIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="#7f1d1d"
    className={`w-${size ?? 6} h-${size ?? 6}`}
  >
    <path
      fillRule="evenodd"
      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm3 10.5a.75.75 0 0 0 0-1.5H9a.75.75 0 0 0 0 1.5h6Z"
      clipRule="evenodd"
    />
  </svg>
);

export default MinusIcon;
