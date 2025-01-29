import { CreateEntryRequest } from "~/media/payloads/entry/create-entry-request";

export const seedEntries: CreateEntryRequest[] = [
  {
    title: "The Republic",
    localizedTitle: "The Republic",
    author: "Plato",
    language: "en",
    genres: [
      "Philosophy",
      "Political Science",
      "Utopian and dystopian fiction",
    ],
    thumbnail: {
      url: "https://www.gutenberg.org/cache/epub/1497/pg1497.cover.medium.jpg",
    },
    meta: {},
    media: [
      {
        meta: {
          format: "epub",
        },
        mirrors: [
          {
            blob: {
              url: "https://www.gutenberg.org/ebooks/1497.epub3.images",
            },
            mimeType: "application/epub+zip",
            provider: "gutenberg",
            size: 522357,
            meta: {},
          },
        ],
      },
      {
        meta: {
          format: "kindle",
        },
        mirrors: [
          {
            blob: {
              url: "https://www.gutenberg.org/ebooks/1497.kf8.images",
            },
            mimeType: "application/x-mobipocket-ebook",
            provider: "gutenberg",
            size: 862846,
            meta: {},
          },
        ],
      },
    ],
  },
  {
    title: "Moby Dick; Or, The Whale",
    localizedTitle: "Moby Dick; Or, The Whale",
    author: "Herman Melville",
    language: "en",
    genres: ["Adventure fiction", "Nautical fiction"],
    thumbnail: {
      url: "https://www.gutenberg.org/cache/epub/2701/pg2701.cover.medium.jpg",
    },
    year: 1851,
    meta: {},
    media: [
      {
        meta: {
          format: "epub",
        },
        mirrors: [
          {
            blob: {
              url: "https://www.gutenberg.org/ebooks/2701.epub3.images",
            },
            mimeType: "application/epub+zip",
            provider: "gutenberg",
            size: 628026,
            meta: {},
          },
        ],
      },
      {
        meta: {
          format: "kindle",
        },
        mirrors: [
          {
            blob: {
              url: "https://www.gutenberg.org/ebooks/2701.kf8.images",
            },
            mimeType: "application/x-mobipocket-ebook",
            provider: "gutenberg",
            size: 1092785,
            meta: {},
          },
        ],
      },
    ],
  },
];
