import { useEffect, useState } from "react";
import makeAnimated from "react-select/animated";
import Select from "react-select";
import type { StylesConfig } from "react-select";
import { useFetcher } from "react-router";
import { v4 as uuidv4 } from "uuid";
import type { z } from "zod";
import MediaForm from "../../components/admin/entries-config/media-form";
import type { Route } from "./+types/add-entry";
import { checkCookie } from "~/server/utils";
import { env } from "~/lib/env";
import type { paths } from "~/lib/api-types";
import { TextArea } from "~/components/ui/text-area";
import {
  entrySchema,
  type EntryFormData,
  type EntryFormInput,
} from "~/schemas/entry-schema";
import { Button } from "~/components/ui/button";
import { PlusIcon } from "~/components/icons";
import Tooltip from "~/components/ui/tooltip";
import { Notification } from "~/components/ui/notification";

type Profile =
  paths["/api/profile"]["get"]["responses"]["200"]["content"]["application/json"];

type FormattedEntryErrors = z.inferFormattedError<typeof entrySchema>;

export const loader = async ({ request }: Route.LoaderArgs) => {
  const cookieHeader = checkCookie(request);

  const res = await fetch(`${env.API_URL}/api/profile`, {
    method: "GET",
    credentials: "include",
    headers: {
      cookie: cookieHeader,
    },
  });

  if (!res.ok) {
    return { user: null };
  }

  const user = (await res.json()) as Profile;
  return { user };
};

type GenreOption = {
  value: string;
  label: string;
};

type ArrayFormItem = EntryFormInput["media"][number] & { id: string };

export const selectStyles: StylesConfig<GenreOption> = {
  control: (styles) => ({
    ...styles,
    backgroundColor: "card-secondary",
    fontSize: "0.875rem",
    paddingLeft: "0.5rem",
    paddingTop: "4px",
    paddingBottom: "4px",
    border: "none",
    outline: "none",
    boxShadow: "none",
    cursor: "pointer",
  }),
  option: (styles) => ({
    ...styles,
    backgroundColor: "#404040",
    ":hover": {
      backgroundColor: "#2f796e",
      cursor: "pointer",
    },
    fontSize: "0.875rem",
    paddingLeft: "1rem",
  }),
  menu: (styles) => ({
    ...styles,
    backgroundColor: "#404040",
    borderRadius: "7px",
  }),
  container: (styles) => ({
    ...styles,
    borderRadius: "7px",
    outline: "none",
  }),
  placeholder: (styles) => ({
    ...styles,
    color: "#a9a9a9",
  }),
  multiValue: (styles) => ({
    ...styles,
    backgroundColor: "#2f796e",
    borderRadius: "3px",
    color: "#fff",
  }),
  multiValueLabel: (styles) => ({
    ...styles,
    color: "#fff",
  }),
  input: (styles) => ({
    ...styles,
    color: "#fff",
  }),
  singleValue: (styles) => ({
    ...styles,
    color: "#fff",
  }),
};

const AddEntry = () => {
  const [pageLoaded, setPageLoaded] = useState(false);
  const [formData, setFormData] = useState<Partial<EntryFormData>>({
    title: "",
    author: "",
    genres: [],
    media: [],
  });

  const [medias, setMedias] = useState<ArrayFormItem[]>(() => [
    {
      id: uuidv4(),
      mirrors: [
        {
          provider: "",
          mimeType: "",
          size: 0,
          blob: {
            url: "",
          },
        },
      ],
    },
  ]);

  const [touchedFields, setTouchedFields] = useState<
    Partial<Record<keyof EntryFormData, boolean>>
  >({});

  const [touchedMedia, setTouchedMedia] = useState<
    Record<string, { blobTouched?: boolean }>
  >({});

  const addMedia = () => {
    setMedias((prev) => [
      ...prev,
      {
        id: uuidv4(),
        mirrors: [
          {
            provider: "",
            mimeType: "",
            size: 0,
            blob: { url: "" },
          },
        ],
      },
    ]);
  };

  const [errors, setErrors] = useState<FormattedEntryErrors>();

  const [submitErrors, setSubmitErrors] = useState<
    Partial<Record<keyof EntryFormData, string[]>>
  >({});

  const handleChange = (field: keyof EntryFormData, value: unknown) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      setTouchedFields((prevTouched) => ({
        ...prevTouched,
        [field]: true,
      }));

      const result = entrySchema.safeParse(updated);

      if (!result.success) {
        setErrors(result.error.format());
      } else {
        setErrors(undefined);
      }

      return updated;
    });
  };

  const handleMediaChange = (
    mediaId: string,
    field: keyof EntryFormData["media"][number]["mirrors"][number]["blob"],
    value: string
  ) => {
    setMedias((prev) => {
      return prev.map((media) =>
        media.id === mediaId
          ? {
              ...media,
              mirrors: [
                {
                  ...media.mirrors[0],
                  blob: {
                    ...media.mirrors[0].blob,
                    [field]: value,
                  },
                },
              ],
            }
          : media
      );
    });

    setTouchedMedia((prev) => ({
      ...prev,
      [mediaId]: {
        ...(prev[mediaId] || {}),
        blobTouched: true,
      },
    }));

    setFormData((prev) => {
      const mediaEntries = medias.map((media) => ({
        mirrors: media.mirrors,
        meta: {},
      }));

      const updated = { ...prev, media: mediaEntries };
      const result = entrySchema.safeParse(updated);

      if (!result.success) {
        setErrors(result.error.format());
      } else {
        setErrors(undefined);
        setSubmitErrors({});
      }

      return updated;
    });
  };

  const removeMedia = (mediaId: string) => {
    setMedias((prev) => prev.filter((media) => media.id !== mediaId));
    setTouchedMedia((prev) => {
      const updated = Object.fromEntries(
        Object.entries(prev).filter(([key]) => key !== mediaId)
      );
      return updated;
    });
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      media: medias.map((media) => ({
        mirrors: media.mirrors,
        meta: {},
      })),
    }));
  }, [medias]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const result = entrySchema.safeParse(formData);
    if (!result.success) {
      e.preventDefault();
      setErrors(result.error.format());
      setSubmitErrors(result.error.flatten().fieldErrors);
    }
  };

  useEffect(() => {
    setPageLoaded(true);
  }, []);

  const genres = [
    { value: "fiction", label: "Fiction" },
    { value: "non-fiction", label: "Non-Fiction" },
    { value: "fantasy", label: "Fantasy" },
    { value: "science-fiction", label: "Science Fiction" },
    { value: "mystery", label: "Mystery" },
    { value: "romance", label: "Romance" },
    { value: "thriller", label: "Thriller" },
    { value: "horror", label: "Horror" },
    { value: "biography", label: "Biography" },
    { value: "self-help", label: "Self-Help" },
    { value: "history", label: "History" },
    { value: "science", label: "Science" },
    { value: "philosophy", label: "Philosophy" },
  ];

  const animatedComponents = makeAnimated();

  const fetcher = useFetcher();
  const [notification, setNotification] = useState(false);

  useEffect(() => {
    if (fetcher.data) {
      setNotification(true);
    }
  }, [fetcher.data]);

  useEffect(() => {
    const result = entrySchema.safeParse(formData);

    if (!result.success) {
      setErrors(result.error.format());
    } else {
      setErrors(undefined);
    }
  }, [formData]);

  const [thumbnailUrl, setThumbnailUrl] = useState("");
  return (
    <>
      {notification && (
        <div className="fixed w-full top-24 mx-auto z-50 flex justify-center">
          <Notification
            variant={
              fetcher.data?.error
                ? "danger"
                : fetcher.data?.success
                  ? "success"
                  : "default"
            }
            onClose={() => {
              setNotification(false);
            }}
            className="w-fit min-w-96 max-w-[70%]"
          >
            {"error" in fetcher.data
              ? fetcher.data?.error
              : fetcher.data?.success
                ? "Node added successfully"
                : null}
          </Notification>
        </div>
      )}
      <fetcher.Form
        method="POST"
        action="/api/entries"
        className="m-10 rounded-lg bg-card pl-10 pr-6 py-5 relative"
        onSubmit={handleSubmit}
      >
        <h1 className="text-2xl font-bold mb-4">Add Entry</h1>
        <div className="flex flex-col gap-5">
          <div className="bg-card-secondary h-[2px] w-full rounded-lg"></div>
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
                        onChange={(e) =>
                          handleChange("language", e.target.value)
                        }
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
          <div className="bg-card-secondary h-[2px] w-full rounded-lg"></div>
          <div className="flex w-full gap-4">
            <div className="w-1/4">
              <h1 className="text-xl font-medium">Description</h1>
              <h4 className="text-sm font-light">
                Add the synopsis or a general description of the book
              </h4>
            </div>
            <div className="flex-1">
              <TextArea
                className="resize-none w-full px-4 py-4 text-sm bg-card-secondary"
                rows={7}
                placeholder="Add description..."
                name="text"
                onChange={(e) => handleChange("description", e.target.value)}
              />
              {touchedFields.description && errors?.description && (
                <p className="text-red-500 text-xs">
                  {errors?.description._errors[0].toString()}
                </p>
              )}
            </div>
          </div>
          <div className="bg-card-secondary h-[2px] w-full rounded-lg"></div>
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
                      const selectedValues = (
                        selectedOptions as GenreOption[]
                      ).map((option) => option.value);
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
          <div className="bg-card-secondary h-[2px] w-full rounded-lg"></div>
          <div className="flex w-full gap-4">
            <div className="w-1/4">
              <h1 className="text-xl font-medium">Mirrors</h1>
              <h4 className="text-sm font-light">
                {pageLoaded
                  ? "Add the mirrors for the book. You can add multiple mirrors."
                  : "Add a mirror of the media."}
              </h4>
            </div>
            <div className="flex-1 flex flex-col gap-4">
              {medias.map((media, index) => (
                <MediaForm
                  key={media.id}
                  pageLoaded={pageLoaded}
                  media={media}
                  mediaIndex={index}
                  handleMediaChange={handleMediaChange}
                  touchedMedia={touchedMedia}
                  errors={errors}
                  removeMedia={removeMedia}
                  medias={medias}
                />
              ))}
              {pageLoaded && (
                <div className="self-end flex">
                  <Button
                    type="button"
                    variant="icon"
                    size="icon"
                    className="p-0 m-0 w-fit h-fit"
                    onClick={() => {
                      addMedia();
                    }}
                  >
                    <Tooltip
                      variant="light"
                      content={"Add a mirror"}
                      className="w-fit whitespace-nowrap"
                    >
                      <PlusIcon size={10} />
                    </Tooltip>
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="bg-card-secondary h-[2px] w-full rounded-lg"></div>
          <Button type="submit" className="w-fit self-end ">
            Submit form
          </Button>
          {submitErrors ? (
            <div className="self-end text-end">
              {Object.entries(submitErrors).map(([key, value]) => (
                <p key={key} className="text-red-500 text-sm p-0 m-0">
                  {value[0]}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      </fetcher.Form>
    </>
  );
};

export default AddEntry;
