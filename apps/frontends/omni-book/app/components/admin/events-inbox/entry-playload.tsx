import type { components } from "~/lib/api-types";

type Entry = components["schemas"]["Entry"];

type EventPayload = {
  entryId?: string;
  [key: string]: unknown;
};

type EntryEdit = components["schemas"]["UpdateEntryRequest"];

export const formatEventPayload = (payload: EventPayload, type: string) => {
  switch (type) {
    case "entry.created":
      return `Entry created: ${JSON.stringify(payload, null, 2)}`;
    default:
      return JSON.stringify(payload, null, 2);
  }
};

export const formatEntryAsParagraph = (entry: Entry | EntryEdit) => {
  if (!entry) return;
  const {
    title,
    author,
    description,
    localizedTitle,
    year,
    language,
    genres,
    thumbnail,
    media,
  } = entry;

  const thumbnailText = (() => {
    if (!thumbnail) return "-";
    if ("url" in thumbnail) return thumbnail.url;
    if ("accessUrl" in thumbnail) return thumbnail.accessUrl;
    return "-";
  })();

  const mediaUrls =
    media
      ?.flatMap((m) =>
        m.mirrors
          ?.map((mirror) => {
            if ("url" in mirror.blob) {
              return mirror.blob.url;
            }
            if ("accessUrl" in mirror.blob) {
              return mirror.blob.accessUrl;
            }
            return "";
          })
          .filter(Boolean)
      )
      .join(", ") || "-";

  return (
    <div className="flex flex-col gap-2">
      {title && (
        <p className="text-sm text-white font-light">
          Title: <span className="text-primary font-semibold">{title}</span>
        </p>
      )}
      {author && (
        <p className="text-sm text-white font-light">
          Author: <span className="text-primary font-semibold">{author}</span>
        </p>
      )}
      {localizedTitle && (
        <p className="text-sm text-white font-light">
          Localized Title:{" "}
          <span className="text-primary font-semibold">{localizedTitle}</span>
        </p>
      )}
      {
        <div className="text-md text-white flex flex-col">
          {description ? (
            <div className="text-primary font-semibold flex flex-col">
              <input
                type="checkbox"
                id="read-more-toggle"
                className="peer hidden"
              />
              <p className="peer-checked:line-clamp-none line-clamp-5 transition-all duration-300 text-sm min-[525px]:text-md">
                <span className="text-sm text-white font-light">
                  Description:{" "}
                </span>
                {description}
              </p>
              <label
                tabIndex={0}
                htmlFor="read-more-toggle"
                className="cursor-pointer peer-checked:hidden inline-flex items-center justify-center gap-2 whitespace-nowrap text-md font-light transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-foreground underline-offset-4 underline hover:text-textHover self-end"
              >
                Read More
              </label>
              <label
                tabIndex={0}
                htmlFor="read-more-toggle"
                className="cursor-pointer hidden peer-checked:inline-block items-center justify-center gap-2 whitespace-nowrap text-md font-light transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-foreground underline-offset-4 underline hover:text-textHover self-end"
              >
                Read Less
              </label>
            </div>
          ) : (
            <>No description available</>
          )}
        </div>
      }
      {year && (
        <p className="text-sm text-white font-light">
          Year: <span className="text-primary font-semibold">{year}</span>
        </p>
      )}
      {language && (
        <p className="text-sm text-white font-light">
          Language:{" "}
          <span className="text-primary font-semibold">{language}</span>
        </p>
      )}
      {genres && genres.length > 0 && (
        <p className="text-sm text-white font-light">
          Genres:{" "}
          <span className="text-primary font-semibold">
            {genres.join(", ")}
          </span>
        </p>
      )}
      {thumbnail && (
        <p className="text-sm text-white font-light">
          Thumbnail:{" "}
          <span className="text-primary font-semibold">{thumbnailText}</span>
        </p>
      )}
      {"createdAt" in entry && entry.createdAt && (
        <p className="text-sm text-white font-light">
          Created At:{" "}
          <span className="text-primary font-semibold">
            {new Date(entry.createdAt).toLocaleString()}
          </span>
        </p>
      )}
      {mediaUrls && mediaUrls !== "-" && (
        <p className="text-sm text-white font-light">
          Media URLs:{" "}
          <span className="text-primary font-semibold">{mediaUrls}</span>
        </p>
      )}
    </div>
  );
};

const EntryPayload = ({ payload }: { payload: Entry | EntryEdit }) => {
  return (
    <div className="flex flex-col gap-2">{formatEntryAsParagraph(payload)}</div>
  );
};
export default EntryPayload;
