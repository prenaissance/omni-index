import asserts from "node:assert";
import type { CreateEntryRequest } from "~/backend/media/payloads/entry/create-entry-request";

type GutendexBook = {
  id: number;
  title: string;
  authors: {
    name: string;
    birth_year?: number;
    death_year?: number;
  }[];
  summaries: string[];
  translators: unknown[];
  subjects: string[];
  bookshelves: string[];
  languages: string[];
  copyright: boolean;
  media_type: "Text";
  formats: Record<string, string>;
  download_count: number;
};

const getFileSize = async (url: string) => {
  const response = await fetch(url, { method: "HEAD" });
  return Number.parseInt(response.headers.get("content-length") ?? "0");
};

const args = process.argv.slice(2);
const id = args[0];
asserts.ok(id, "The Gutenberg id is required to be passed as an argument");
asserts.ok(
  process.env.SESSION,
  "session is required to be set as an environment variable"
);

const url = `https://gutendex.com/books/${id}`;
const response = await fetch(url);
const book = (await response.json()) as GutendexBook;

const thumbnail = Object.entries(book.formats).find(([key]) =>
  /image\/.*/.test(key)
)?.[1];
const formats = Object.entries(book.formats).filter(
  ([key]) => !/image\/.*/.test(key)
);

const entry: CreateEntryRequest = {
  title: book.title,
  author: book.authors.map((a) => a.name)[0] || "Unknown",
  description: book.summaries[0],
  genres: book.subjects,
  language: book.languages[0] ?? "en",
  thumbnail: thumbnail ? { url: thumbnail } : undefined,
  media: await Promise.all(
    formats.map(async ([key, url]) => ({
      meta: {},
      mirrors: [
        {
          blob: {
            url,
          },
          provider: "gutenberg",
          size: await getFileSize(url),
          mimeType: key,
          meta: {},
        },
      ],
    }))
  ),
  meta: {},
};

const createResponse = await fetch("http://localhost:8080/api/entries", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    session: process.env.SESSION,
  },
  body: JSON.stringify(entry),
});

if (createResponse.ok) {
  console.log("Entry created successfully");
} else {
  console.error(`Failed to create entry: ${createResponse.status}`);
  console.error(await createResponse.json());
  process.exit(1);
}
