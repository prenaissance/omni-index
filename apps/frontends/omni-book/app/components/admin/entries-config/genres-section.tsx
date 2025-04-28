import Select from "react-select";
import makeAnimated from "react-select/animated";
import { selectStyles } from "~/components/ui/helpers";
import type {
  EntryFormData,
  FormattedEntryErrors,
} from "~/schemas/entry-schema";

type GenreOption = {
  value: string;
  label: string;
};

type GenresSectionProps = {
  handleChange: (field: keyof EntryFormData, value: unknown) => void;
  errors: FormattedEntryErrors | undefined;
  touchedFields: Record<string, boolean>;
  pageLoaded: boolean;
  genres: { value: string; label: string }[];
  selectStyles: unknown;
};

const GenresSection = ({
  handleChange,
  errors,
  touchedFields,
  pageLoaded,
  genres,
}: GenresSectionProps) => {
  const animatedComponents = makeAnimated();

  return (
    <div className="flex w-full gap-4">
      <div className="w-1/4">
        <h1 className="text-xl font-medium">Genres</h1>
        <h4 className="text-sm font-light">
          Select one or more genres for the book
        </h4>
      </div>
      <div className="flex-1">
        {pageLoaded ? (
          <div className="flex flex-col gap-1">
            <p className="text-sm font-light mb-1">
              Genres<span className="text-red-500">*</span>
            </p>
            <Select
              isMulti
              closeMenuOnSelect={false}
              name="genres"
              options={genres}
              className="bg-card-secondary"
              classNamePrefix="select"
              components={animatedComponents}
              styles={selectStyles}
              onChange={(selectedOptions) => {
                const selectedValues = (selectedOptions as GenreOption[]).map(
                  (option) => option.value
                );
                handleChange("genres", selectedValues);
              }}
              required
            />
            {touchedFields.genres && errors?.genres && (
              <p className="text-red-500 text-xs">
                {errors?.genres._errors[0].toString()}
              </p>
            )}
          </div>
        ) : (
          <label className="flex-1">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-light">
                Genres<span className="text-red-500">*</span>
              </p>
              <select
                name="genres"
                multiple
                className="h-40 px-4 py-2 bg-card-secondary rounded-lg outline-none [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-card-secondary [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-lg [&::-webkit-scrollbar:horizontal]:h-1
[&::-webkit-scrollbar:vertical]:w-1 [&::-webkit-scrollbar-corner]:bg-transparent"
                required
                onChange={(e) => {
                  const selectedOptions = Array.from(
                    e.currentTarget.selectedOptions
                  ).map((option) => option.value);
                  handleChange("genres", selectedOptions);
                }}
              >
                {genres.map((genre) => (
                  <option
                    key={genre.value}
                    value={genre.value}
                    className="hover:bg-accent"
                  >
                    {genre.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Hold Ctrl (or Cmd on Mac) to select multiple genres.
              </p>
            </div>
          </label>
        )}
      </div>
    </div>
  );
};

export default GenresSection;
