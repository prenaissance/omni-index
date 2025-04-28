import Select from "react-select";
import makeAnimated from "react-select/animated";
import type { z } from "zod";
import { selectStyles } from "../../../routes/admin/add-entry";
import { formatSelector } from "~/lib/utils";
import type {
  EntryFormData,
  EntryFormInput,
  entrySchema,
} from "~/schemas/entry-schema";
import { Button } from "~/components/ui/button";
import Tooltip from "~/components/ui/tooltip";
import MinusIcon from "~/components/icons/minus";

type ArrayFormItem = EntryFormInput["media"][number] & { id: string };

type FormattedEntryErrors = z.inferFormattedError<typeof entrySchema>;

type MediaFormProps = {
  pageLoaded: boolean;
  media: ArrayFormItem;
  mediaIndex: number;
  handleMediaChange: (
    mediaId: string,
    field: keyof EntryFormData["media"][number]["mirrors"][number]["blob"],
    value: string
  ) => void;
  touchedMedia: Record<string, { blobTouched?: boolean }>;
  errors: FormattedEntryErrors | undefined;
  removeMedia: (mediaId: string) => void;
  medias: ArrayFormItem[];
};

const MediaForm = ({
  pageLoaded,
  media,
  mediaIndex,
  handleMediaChange,
  touchedMedia,
  errors,
  removeMedia,
  medias,
}: MediaFormProps) => {
  const providers = [
    { value: "gutenberg", label: "Gutenberg" },
    { value: "libgen", label: "Libgen" },
  ];
  const animatedComponents = makeAnimated();

  const blobTouched = touchedMedia[media.id]?.blobTouched;

  const blobUrlError =
    errors?.media?.[mediaIndex]?.mirrors?.[0]?.blob?.url?._errors[0] || null;

  return (
    <div className="flex-1 flex flex-col gap-4 bg-[#353535] p-5 rounded-lg">
      <div className="flex gap-4">
        <label className="flex-1">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-light">Provider</p>
            {pageLoaded ? (
              <Select
                closeMenuOnSelect={false}
                name={`media[${mediaIndex}][mirrors][0][provider]`}
                options={providers}
                className="bg-card-secondary"
                classNamePrefix="select"
                components={animatedComponents}
                styles={selectStyles}
                isClearable
              />
            ) : (
              <select
                name={`media[${mediaIndex}][mirrors][0][provider]`}
                className="w-full bg-card-secondary rounded-lg border-r-8 border-transparent px-4 py-3 text-sm outline outline-neutral-700"
              >
                <option value="">No provider selected</option>
                {providers.map((provider) => (
                  <option
                    key={provider.value}
                    value={provider.value}
                    className="hover:bg-accent"
                  >
                    {provider.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </label>
        <label className="flex-1">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-light">Mimetype</p>
            {pageLoaded ? (
              <Select
                closeMenuOnSelect={false}
                name={`media[${mediaIndex}][mirrors][0][mimeType]`}
                options={formatSelector}
                className="bg-card-secondary"
                classNamePrefix="select"
                components={animatedComponents}
                styles={selectStyles}
                isClearable
              />
            ) : (
              <select
                name={`media[${mediaIndex}][mirrors][0][mimeType]`}
                className="w-full bg-card-secondary rounded-lg border-r-8 border-transparent px-4 py-3 text-sm outline outline-neutral-700"
              >
                <option value="">No mimetype selected</option>
                {formatSelector.map((format) => (
                  <option
                    key={format.value}
                    value={format.value}
                    className="hover:bg-accent"
                  >
                    {format.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </label>
        <label className="flex-1 h-full">
          <div className="flex flex-col gap-1 h-full">
            <p className="text-sm font-light">Size (Bytes)</p>
            <input
              name={`media[${mediaIndex}][mirrors][0][size]`}
              type="number"
              className="px-4 py-2 h-full bg-card-secondary rounded-lg outline-none placeholder:text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="12000"
            />
          </div>
        </label>
      </div>
      <div className="flex items-end gap-4">
        <label className="flex-1">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-light">
              Blob Url<span className="text-red-500">*</span>
            </p>
            <input
              name={`media-${media.id}-blob-url`}
              type="text"
              value={media.mirrors[0].blob.url}
              onChange={(e) =>
                handleMediaChange(media.id, "url", e.target.value)
              }
              placeholder="https://example.com/blob"
              className="px-4 py-2 bg-card-secondary rounded-lg outline-none placeholder:text-sm"
              required
            />
            {blobTouched && blobUrlError ? (
              <p className="text-red-500 text-xs">{blobUrlError}</p>
            ) : null}
          </div>
        </label>
        <Button
          type="button"
          variant="icon"
          size="icon"
          className="p-0 m-0 w-fit h-fit disabled:hidden"
          onClick={() => removeMedia(media.id)}
          disabled={medias.length <= 1}
        >
          <Tooltip
            variant="destructive"
            content={"Remove mirror"}
            className="w-fit whitespace-nowrap"
          >
            <MinusIcon size={10} />
          </Tooltip>
        </Button>
      </div>
    </div>
  );
};

export default MediaForm;
