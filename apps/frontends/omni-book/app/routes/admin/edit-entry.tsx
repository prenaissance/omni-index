import { useEffect, useRef, useState } from "react";
import { useFetcher, useSearchParams } from "react-router";
import { v4 as uuidv4 } from "uuid";
import MediaForm from "../../components/admin/entries-config/media-form";
import GeneralSection, {
  type GeneralSectionValues,
} from "../../components/admin/entries-config/general-section";
import type { Route } from "./+types/edit-entry";
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
import DescriptionSection, {
  type DescriptionSectionValues,
} from "~/components/admin/entries-config/description-section";
import GenresSection, {
  type GenreOption,
} from "~/components/admin/entries-config/genres-section";

type Profile =
  paths["/api/profile"]["get"]["responses"]["200"]["content"]["application/json"];

type Genres =
  paths["/api/entries/genres"]["get"]["responses"]["200"]["content"]["application/json"];

type BookResponseType =
  paths["/api/entries/{entryId}"]["get"]["responses"]["200"]["content"]["application/json"];

type ArrayFormItem = EntryFormInput["media"][number] & { id: string };

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const cookieHeader = checkCookie(request);

  const res = await fetch(`${env.API_URL}/api/profile`, {
    method: "GET",
    credentials: "include",
    headers: {
      cookie: cookieHeader,
    },
  });

  if (!res.ok) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const user = (await res.json()) as Profile;

  const bookId = params.bookId;
  if (!bookId) {
    throw new Response(JSON.stringify({ error: "No bookId provided" }), {
      status: 400,
    });
  }

  const response = await fetch(`${env.API_URL}/api/entries/${bookId}`, {
    headers: request.headers,
  });

  if (!response.ok) {
    throw new Response(JSON.stringify({ error: "Book not found" }), {
      status: 404,
    });
  }

  const entry: BookResponseType = await response.json();

  const genresRes = await fetch(`${env.API_URL}/api/entries/genres`, {
    method: "GET",
  });

  if (!genresRes.ok) {
    return { user, genres: [], entry };
  }

  const genresArray = (await genresRes.json()) as Genres;

  const genres = genresArray.map((genre) => ({
    value: genre,
    label: genre,
  }));

  return { user, genres, entry };
};

export default function EditEntry({ loaderData }: Route.ComponentProps) {
  const { genres, entry } = loaderData;
  const [pageLoaded, setPageLoaded] = useState(false);

  const existingGenres = genres.filter((genre) =>
    entry.genres.includes(genre.value)
  );

  const genresSectionValues: GenreOption[] = existingGenres;

  const [formData, setFormData] = useState<Partial<EntryFormData>>({
    title: "",
    author: "",
    genres: genresSectionValues.map((genre) => genre.value),
    media: [],
  });

  const formRef = useRef<HTMLFormElement>(null);

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

  const [searchParams] = useSearchParams();

  const errorMessage = searchParams.get("error");
  const successMessage = searchParams.get("success");

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

  useEffect(() => {
    if (fetcher?.data?.success) {
      formRef.current?.reset();
      setThumbnailUrl("");
      setMedias([
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
      setTouchedFields({});
      setTouchedMedia({});
      setFormData({
        genres: [],
      });
    }
  }, [fetcher.data]);

  const generalSectionValues: GeneralSectionValues = {
    title: entry.title,
    author: entry.author,
    year: entry.year,
    localizedTitle: entry.localizedTitle,
    language: entry.language,
    thumbnail: {
      url:
        entry.thumbnail && "url" in entry.thumbnail ? entry.thumbnail.url : "",
    },
  };

  const [thumbnailUrl, setThumbnailUrl] = useState(
    entry.thumbnail && "url" in entry.thumbnail ? entry.thumbnail.url : ""
  );

  const descriptionSectionValues: DescriptionSectionValues = {
    description: entry.description,
  };

  return (
    <>
      {notification ? (
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
                ? "Entry added successfully"
                : null}
          </Notification>
        </div>
      ) : errorMessage ? (
        <div className="fixed w-full top-24 mx-auto z-50 flex justify-center">
          <Notification
            variant={"danger"}
            closeButtonLink={"/admin/add-entry"}
            className="w-fit min-w-96 max-w-[70%]"
          >
            {errorMessage}
          </Notification>
        </div>
      ) : successMessage ? (
        <div className="fixed w-full top-24 mx-auto z-50 flex justify-center">
          <Notification
            variant={"success"}
            closeButtonLink={"/admin/add-entry"}
            className="w-fit min-w-96 max-w-[70%]"
          >
            {successMessage}
          </Notification>
        </div>
      ) : null}
      <fetcher.Form
        method="POST"
        action="/api/entries"
        className="m-10 rounded-lg bg-card pl-10 pr-6 py-5 relative"
        onSubmit={handleSubmit}
        ref={formRef}
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
            values={generalSectionValues}
          />
          <div className="bg-card-secondary h-[2px] w-full rounded-lg"></div>
          <DescriptionSection
            handleChange={handleChange}
            errors={errors}
            touchedFields={touchedFields}
            values={descriptionSectionValues}
          />
          <div className="bg-card-secondary h-[2px] w-full rounded-lg"></div>
          <GenresSection
            handleChange={handleChange}
            errors={errors}
            touchedFields={touchedFields}
            pageLoaded={pageLoaded}
            genres={genres ?? []}
            selectedGenres={formData.genres || []}
            values={genresSectionValues}
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
}
