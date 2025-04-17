import { z } from "zod";

const urlRegex =
  /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;

export const nodeSchema = z.object({
  url: z.string().regex(urlRegex, {
    message: "Must be a valid HTTP/HTTPS URL",
  }),
});

export type NodeFormData = z.infer<typeof nodeSchema>;
