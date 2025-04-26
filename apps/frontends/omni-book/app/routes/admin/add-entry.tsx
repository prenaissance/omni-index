import { useEffect, useState } from "react";
import makeAnimated from "react-select/animated";
import Select from "react-select";
import type { StylesConfig } from "react-select";
import { Form } from "react-router";
import type { Route } from "./+types/add-entry";
import { checkCookie } from "~/server/utils";
import { env } from "~/lib/env";
import type { paths } from "~/lib/api-types";
import { TextArea } from "~/components/ui/text-area";
import { entrySchema, type EntryFormData } from "~/schemas/entry-schema";
import { Button } from "~/components/ui/button";

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
type GenreOption = {
  value: string;
  label: string;
};
const genresStyles: StylesConfig<GenreOption> = {
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
};

const AddEntry = () => {
  const [pageLoaded, setPageLoaded] = useState(false);
  const [formData, setFormData] = useState<Partial<EntryFormData>>({
    title: "",
    author: "",
    genres: [],
    media: [],
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof EntryFormData, string[]>>
  >({});

  const handleChange = (field: keyof EntryFormData, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const result = entrySchema.safeParse(formData);
    if (!result.success) {
      e.preventDefault();
      setErrors(result.error.flatten().fieldErrors);
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
  ];

  const animatedComponents = makeAnimated();

  const [thumbnailUrl, setThumbnailUrl] = useState("");
  return (
    <Form
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
          <div className="flex-1 flex gap-4">
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
                    {errors.title && (
                      <p className="text-red-500 text-sm">{errors.title[0]}</p>
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
                    {errors["localizedTitle"] && (
                      <p className="text-red-500 text-sm">
                        {errors["localizedTitle"][0]}
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
                    {errors.author && (
                      <p className="text-red-500 text-sm">{errors.author[0]}</p>
                    )}
                  </div>
                </label>
                <label className="flex-1">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-light">Year</p>
                    <input
                      name="year"
                      type="number"
                      className="px-4 py-2 bg-card-secondary rounded-lg outline-none placeholder:text-sm"
                      placeholder="1448"
                      min={0}
                      max={new Date().getFullYear()}
                      onChange={(e) => handleChange("year", e.target.value)}
                    />
                    {errors.year && (
                      <p className="text-red-500 text-sm">{errors.year[0]}</p>
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
                    {errors.language && (
                      <p className="text-red-500 text-sm">
                        {errors.language[0]}
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
                      name="thumbnail-url"
                      type="text"
                      placeholder="Thumbnail url"
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
            <div className="flex items-center h-[100%]">
              {thumbnailUrl && (
                <img
                  src={thumbnailUrl}
                  alt="Thumbnail"
                  className="max-h-[230px] min-h-[230px] object-fill border rounded"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
            </div>
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
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description[0]}</p>
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
              <>
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
                  styles={genresStyles}
                  onChange={(selectedOptions) => {
                    const selectedValues = (
                      selectedOptions as GenreOption[]
                    ).map((option) => option.value);
                    handleChange("genres", selectedValues);
                  }}
                />
              </>
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
                        className="hover:bg-accent selection:bg-red "
                      >
                        {genre.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Hold Ctrl (or Cmd on Mac) to select multiple genres.
                  </p>
                  {errors.genres && (
                    <p className="text-red-500 text-sm">{errors.genres[0]}</p>
                  )}
                </div>
              </label>
            )}
          </div>
        </div>
        <Button type="submit" className="w-fit self-end ">
          Submit form
        </Button>
        {errors
          ? Object.entries(errors).map(([key, value]) => (
              <p key={key} className="text-red-500 text-sm self-end">
                {key}: {value[0]}
              </p>
            ))
          : null}
        <div className="bg-card-secondary h-[2px] w-full rounded-lg"></div>
      </div>
    </Form>
  );
};

export default AddEntry;
