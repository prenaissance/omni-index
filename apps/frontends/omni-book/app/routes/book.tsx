import { use, useEffect, useState, type FC } from "react";
import { useLoaderData, useParams } from "react-router";
import type { Route } from "./+types/book";
import type { paths, components } from "~/lib/api-types";
import { env } from "~/lib/env";
import { Button } from "~/components/ui/button";
import Popup from "~/components/ui/popup";
import { FORMAT_INFO } from "~/lib/formats";

type BookType = components["schemas"]["Entry"];
type BookResponseType =
  paths["/api/entries/{id}"]["get"]["responses"]["200"]["content"]["application/json"];

export const loader = async ({ params }: Route.LoaderArgs) => {
  const { bookId } = params;

  if (!bookId) {
    throw new Response(JSON.stringify({ error: "No bookId provided" }), {
      status: 400,
    });
  }

  const response = await fetch(`${env.VITE_API_URL}/api/entries/${bookId}`);

  if (!response.ok) {
    throw new Response(JSON.stringify({ error: "Book not found" }), {
      status: 404,
    });
  }

  const data: BookResponseType = await response.json();
  return data;
};

const Book: FC = ({}) => {
  // const data = useLoaderData<typeof loader>();

  // useEffect(() => {
  //   console.log("Book data", data);
  // }, [data]);

  const data = {
    _id: "67c7757c38d8cfbd05d11c5d",
    title: "The Republic",
    author: "Plato",
    slug: "the-republic_plato",
    createdAt: "2025-03-04T21:49:48.445Z",
    updatedAt: "2025-03-04T21:49:48.445Z",
    meta: {},
    media: [
      {
        _id: "67c7757c38d8cfbd05d11c5a",
        mirrors: [
          {
            _id: "67c7757c38d8cfbd05d11c59",
            blob: {
              url: "https://www.gutenberg.org/ebooks/1497.epub3.images",
            },
            meta: {},
            provider: "gutenberg",
            mimeType: "application/epub+zip",
            size: 522357,
          },
        ],
        meta: {
          format: "epub",
        },
      },
      {
        _id: "67c7757c38d8cfbd05d11c5c",
        mirrors: [
          {
            _id: "67c7757c38d8cfbd05d11c5b",
            blob: {
              url: "https://www.gutenberg.org/ebooks/1497.kf8.images",
            },
            meta: {},
            provider: "gutenberg",
            mimeType: "application/x-mobipocket-ebook",
            size: 862846,
          },
        ],
        meta: {
          format: "kindle",
        },
      },
    ],
    genres: [
      "Philosophy",
      "Political Science",
      "Utopian and dystopian fiction",
    ],
    localizedTitle: "The Republic",
    year: 1938,
    language: "en",
    thumbnail: {
      url: "https://www.gutenberg.org/cache/epub/1497/pg1497.cover.medium.jpg",
    },
  };

  return (
    <div className="bg-[url('/gradient.jpg')] bg-cover bg-center h-[550px]">
      <div className="px-40 flex items-center justify-between h-full gap-10">
        <div className="h-full">
          <img
            src={
              data.thumbnail && "url" in data.thumbnail
                ? data.thumbnail.url
                : "./placeholder.jpg"
            }
            className="py-20 h-full w-auto object-cover"
            alt="thumbnail"
          />
        </div>
        <div className="flex-1">
          <h1 className="text-5xl font-semibold mb-2">{data.title}</h1>
          <div className="text-lg font-medium mb-3 flex gap-2 items-center">
            <p>{data.author}</p>
            {data.year !== null && data.year !== 0 && (
              <>
                <div className="w-[2px] h-6 bg-white"></div>
                <p>{data.year}</p>
              </>
            )}
          </div>

          <div className="flex flex-row space-x-2 mb-3">
            {data.genres.map((genre) => (
              <span
                key={genre}
                className="bg-card px-2 py-1 rounded-md text-[0.8rem] font-medium"
              >
                {genre}
              </span>
            ))}
          </div>
          <p className="text-md text-white">
            Lorem Ipsum has been the industrys standard dummy text ever since
            the 1500s, when an unknown printer took a galley of type and
            scrambled it to make a type specimen book. It has survived not only
            five centuries, but also the leap into electronic typesetting,
            remaining essentially unchanged. It was popularised in the 1960s
            with the release of Letraset.
          </p>
        </div>
        <div className="bg-[#ffffff33] h-full w-1/4 flex flex-col items-center justify-center p-10">
          <p className="text-xl font-medium mb-6">
            Choose how to read this book
          </p>
          <div className="flex flex-col gap-2 w-full items-start">
            {data.media.map((media) => (
              <div key={media._id} className="w-full flex items-center gap-4">
                <Button
                  onClick={() => {
                    window.open(media.mirrors[0].blob.url, "_blank");
                  }}
                  variant={"secondary"}
                  className="w-2/5"
                >
                  {media.meta.format}
                </Button>
                <p>
                  <strong>
                    {(media.mirrors[0].size / 1000000).toPrecision(3)}
                  </strong>{" "}
                  MB{" "}
                </p>
                <Popup content={FORMAT_INFO[media.meta.format]} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Book;
