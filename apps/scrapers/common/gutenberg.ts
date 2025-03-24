import { CreateEntryRequest } from "~/backend/media/payloads/entry/create-entry-request";
import { getFileSize } from "./utilities";

export type GutendexBook = {
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

export const gutenbergToEntry = async (
  book: GutendexBook
): Promise<CreateEntryRequest> => {
  const thumbnail = Object.entries(book.formats).find(([key]) =>
    /image\/.*/.test(key)
  )?.[1];
  const formats = Object.entries(book.formats).filter(
    ([key]) => !/image\/.*/.test(key)
  );

  return {
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
};
