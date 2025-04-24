import { useEffect, useState } from "react";
import makeAnimated from "react-select/animated";
import Select from "react-select";
import type { StylesConfig } from "react-select";
import type { Route } from "./+types/add-entry";
import { checkCookie } from "~/server/utils";
import { env } from "~/lib/env";
import type { paths } from "~/lib/api-types";
import { TextArea } from "~/components/ui/text-area";

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
    <div className="m-10 rounded-lg bg-card pl-10 pr-6 py-5 relative">
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
                    />
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
                    />
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
                    />
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
                    />
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
                    />
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
                      onChange={(e) => setThumbnailUrl(e.target.value)}
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
            />
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
                </div>
              </label>
            )}
          </div>
        </div>
        <div className="bg-card-secondary h-[2px] w-full rounded-lg"></div>
      </div>
    </div>
  );
};

export default AddEntry;
