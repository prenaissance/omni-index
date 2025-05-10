import type { components } from "./api-types";

type UpdateEntryRequest = components["schemas"]["UpdateEntryRequest"];
type Media = components["schemas"]["Media"];
type Mirror = components["schemas"]["Index"];

const normalizeMedia = (media: UpdateEntryRequest["media"] | undefined) => {
  if (!media) return [];

  return media.map((mediaItem) => {
    const { _id, mirrors, ...rest } = mediaItem as Media;
    return {
      ...rest,
      mirrors: mirrors.map((mirror: Mirror) => {
        const { _id, ...mirrorRest } = mirror as Mirror;
        return mirrorRest;
      }),
    };
  });
};

const buildDiff = (
  existing: UpdateEntryRequest,
  submitted: UpdateEntryRequest
): Partial<UpdateEntryRequest> => {
  const diff: Partial<UpdateEntryRequest> = {};

  if (submitted.title !== undefined && submitted.title !== existing.title) {
    diff.title = submitted.title;
  }
  if (submitted.author !== undefined && submitted.author !== existing.author) {
    diff.author = submitted.author;
  }
  if (
    submitted.description !== undefined &&
    submitted.description !== existing.description
  ) {
    diff.description = submitted.description;
  }
  if (
    submitted.localizedTitle !== undefined &&
    submitted.localizedTitle !== existing.localizedTitle
  ) {
    diff.localizedTitle = submitted.localizedTitle;
  }
  if (submitted.year !== undefined && submitted.year !== existing.year) {
    diff.year = submitted.year;
  }
  if (
    submitted.language !== undefined &&
    submitted.language !== existing.language
  ) {
    diff.language = submitted.language;
  }

  if (
    submitted.genres &&
    JSON.stringify(submitted.genres) !== JSON.stringify(existing.genres)
  ) {
    diff.genres = submitted.genres;
  }

  if (
    submitted.thumbnail &&
    "url" in submitted.thumbnail &&
    existing.thumbnail &&
    "url" in existing.thumbnail &&
    submitted.thumbnail.url !== existing.thumbnail?.url
  ) {
    diff.thumbnail = submitted.thumbnail;
  }

  if (submitted.media) {
    const normalizedExisting = normalizeMedia(existing.media);
    const normalizedSubmitted = normalizeMedia(submitted.media);

    if (
      JSON.stringify(normalizedExisting) !== JSON.stringify(normalizedSubmitted)
    ) {
      diff.media = submitted.media;
    }
  }

  return diff;
};

export default buildDiff;
