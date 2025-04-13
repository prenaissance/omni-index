import ChevronIcon from "./icons/chevron";

type TrustedLevelFieldProps = {
  value: string;
};

export const TrustedLevelField = ({ value }: TrustedLevelFieldProps) => {
  return (
    <details className="relative inline-block text-left w-full mr-5 group">
      <summary className="list-none cursor-pointer flex justify-between items-center gap-x-1.5 bg-card-secondary rounded-lg px-4 py-2 mr-5 hover:bg-accent group-open:bg-accent">
        <div>{value}</div>
        <ChevronIcon direction="down" size={4} />
      </summary>

      <div className="absolute left-0 right-5 z-10 mt-2 max-w-full origin-top-right rounded-md bg-card-secondary shadow-lg ">
        <div className="py-1">
          <form action="#" method="POST">
            <button
              type="submit"
              className="block w-full px-4 py-2 text-left text-sm hover:bg-accent"
            >
              Trusted
            </button>
          </form>
        </div>
        <div className="py-1">
          <form action="#" method="POST">
            <button
              type="submit"
              className="block w-full px-4 py-2 text-left text-sm hover:bg-accent"
            >
              Semi-trusted
            </button>
          </form>
        </div>
      </div>
    </details>
  );
};
