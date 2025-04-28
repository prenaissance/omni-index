import type {
  EntryFormData,
  FormattedEntryErrors,
} from "~/schemas/entry-schema";

type GeneralSectionProps = {
  handleChange: (field: keyof EntryFormData, value: unknown) => void;
  errors: FormattedEntryErrors | undefined;
  touchedFields: Record<string, boolean>;
  setThumbnailUrl: (url: string) => void;
  thumbnailUrl: string;
};

const GeneralSection = ({
  handleChange,
  errors,
  touchedFields,
  setThumbnailUrl,
  thumbnailUrl,
}: GeneralSectionProps) => {
  return (
    <div className="flex w-full gap-4">
      <div className="w-1/4">
        <h1 className="text-xl font-medium">General</h1>
        <h4 className="text-sm font-light">
          Add general information about the book
        </h4>
      </div>
      <div className="flex-1 flex ">
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex gap-4">
            <label className="flex-1">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-light">
                  Title<span className="text-red-500">*</span>
                </p>
                <input
                  name="title"
                  type="text"
                  className="px-4 py-2 bg-card-secondary rounded-lg outline-none placeholder:text-sm"
                  placeholder="The Republic"
                  required
                  onChange={(e) => handleChange("title", e.target.value)}
                />
                {touchedFields.title && errors?.title && (
                  <p className="text-red-500 text-xs">
                    {errors?.title._errors[0].toString()}
                  </p>
                )}
              </div>
            </label>
            <label className="flex-1">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-light">Localized Title</p>
                <input
                  name="localized-title"
                  type="text"
                  className="px-4 py-2 bg-card-secondary rounded-lg outline-none placeholder:text-sm"
                  placeholder="The Republic"
                  onChange={(e) =>
                    handleChange("localizedTitle", e.target.value)
                  }
                />
                {errors?.localizedTitle && (
                  <p className="text-red-500 text-sm">
                    {errors?.localizedTitle._errors[0].toString()}
                  </p>
                )}
              </div>
            </label>
          </div>
          <div className="flex gap-4">
            <label className="flex-1">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-light">
                  Author<span className="text-red-500">*</span>
                </p>
                <input
                  name="author"
                  type="text"
                  className="px-4 py-2 bg-card-secondary rounded-lg outline-none placeholder:text-sm"
                  placeholder="Plato"
                  required
                  onChange={(e) => handleChange("author", e.target.value)}
                />
                {touchedFields.author && errors?.author && (
                  <p className="text-red-500 text-xs">
                    {errors?.author._errors[0].toString()}
                  </p>
                )}
              </div>
            </label>
            <label className="flex-1">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-light">Year</p>
                <input
                  name="year"
                  type="number"
                  className="px-4 py-2 bg-card-secondary rounded-lg outline-none placeholder:text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="1448"
                  min={0}
                  max={new Date().getFullYear()}
                  onChange={(e) => handleChange("year", e.target.value)}
                />
                {touchedFields.year && errors?.year && (
                  <p className="text-red-500 text-xs">
                    {errors.year._errors[0].toString()}
                  </p>
                )}
              </div>
            </label>
            <label className="flex-1">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-light">Language</p>
                <input
                  name="language"
                  type="text"
                  className="px-4 py-2 bg-card-secondary rounded-lg outline-none placeholder:text-sm"
                  placeholder="English"
                  onChange={(e) => handleChange("language", e.target.value)}
                />
                {touchedFields.language && errors?.language && (
                  <p className="text-red-500 text-xs">
                    {errors.language._errors[0].toString()}
                  </p>
                )}
              </div>
            </label>
          </div>
          <div>
            <label className="flex-1">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-light">Thumbnail Url</p>
                <input
                  name="thumbnail"
                  type="text"
                  placeholder="https://example.com/thumbnail.jpg"
                  value={thumbnailUrl}
                  onChange={(e) => {
                    setThumbnailUrl(e.target.value);
                    handleChange("thumbnail", e.target.value);
                  }}
                  className="px-4 py-2 bg-card-secondary rounded-lg outline-none placeholder:text-sm"
                />
              </div>
            </label>
          </div>
        </div>
        {thumbnailUrl && (
          <div className="flex items-center h-[100%] ml-4">
            <img
              src={thumbnailUrl}
              alt="Thumbnail"
              className="max-h-[230px] min-h-[230px] object-fill border rounded"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneralSection;
