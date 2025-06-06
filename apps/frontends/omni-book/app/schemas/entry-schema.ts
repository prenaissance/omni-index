import { z } from "zod";
import type { components } from "~/lib/api-types";

type CreateEntry = components["schemas"]["CreateEntryRequest"];
export type Mirror = components["schemas"]["CreateIndexRequest"];
type MirrorWithoutMeta = Omit<Mirror, "meta">;
type EntryWithoutMeta = Omit<CreateEntry, "meta">;
type EntryWithoutMedia = Omit<EntryWithoutMeta, "media">;

const mirrorSchema = z.object({
  provider: z.string().optional(),
  mimeType: z.string().optional(),
  size: z.number().optional(),
  blob: z.object({
    url: z
      .string()
      .min(1, "Blob URL is required")
      .url("Blob must be a valid URL"),
  }),
}) satisfies z.ZodType<MirrorWithoutMeta>;

const mediaSchema = z.object({
  mirrors: z
    .array(mirrorSchema)
    .min(1, { message: "At least one mirror required" }),
});

export const entrySchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  author: z.string().min(1, { message: "Author is required" }),
  localizedTitle: z.string().optional(),
  year: z
    .number()
    .min(0, { message: "Year must be a positive number" })
    .max(new Date().getFullYear(), {
      message: `Year must be less than or equal to ${new Date().getFullYear()}`,
    })
    .optional(),
  language: z.string().optional(),
  thumbnail: z
    .object({
      url: z.string(),
    })
    .optional(),
  genres: z.array(z.string()).min(1, "Select at least one genre"),
  media: z.array(mediaSchema),
}) satisfies z.ZodType<EntryWithoutMedia>;

export type EntryFormInput = z.input<typeof entrySchema>;
export type EntryFormData = z.infer<typeof entrySchema>;
export type FormattedEntryErrors = z.inferFormattedError<typeof entrySchema>;
