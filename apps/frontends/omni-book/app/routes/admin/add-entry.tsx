import { useEffect, useState } from "react";
import type { StylesConfig } from "react-select";
import { useFetcher } from "react-router";
import { v4 as uuidv4 } from "uuid";
import MediaForm from "../../components/admin/entries-config/media-form";
import GeneralSection from "../../components/admin/entries-config/general-section";
import type { Route } from "./+types/add-entry";
import { checkCookie } from "~/server/utils";
import { env } from "~/lib/env";
import type { paths } from "~/lib/api-types";
import {
  entrySchema,
  type EntryFormData,
  type EntryFormInput,
  type FormattedEntryErrors,
} from "~/schemas/entry-schema";
import { Button } from "~/components/ui/button";
import { PlusIcon } from "~/components/icons";
import Tooltip from "~/components/ui/tooltip";
import { Notification } from "~/components/ui/notification";
import DescriptionSection from "~/components/admin/entries-config/description-section";
import GenresSection from "~/components/admin/entries-config/genres-section";

type Profile =
  paths["/api/profile"]["get"]["responses"]["200"]["content"]["application/json"];

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

type SelectOption = {
  value: string;
  label: string;
};

type ArrayFormItem = EntryFormInput["media"][number] & { id: string };

export const selectStyles: StylesConfig<SelectOption> = {
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
          <GeneralSection
            handleChange={handleChange}
            errors={errors}
            touchedFields={touchedFields}
            setThumbnailUrl={setThumbnailUrl}
            thumbnailUrl={thumbnailUrl}
          />
          <div className="bg-card-secondary h-[2px] w-full rounded-lg"></div>
          <DescriptionSection
            handleChange={handleChange}
            errors={errors}
            touchedFields={touchedFields}
          />
          <div className="bg-card-secondary h-[2px] w-full rounded-lg"></div>
          <GenresSection
            handleChange={handleChange}
            errors={errors}
            touchedFields={touchedFields}
            pageLoaded={pageLoaded}
            genres={genres}
            selectStyles={selectStyles}
          />
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
