import { z } from "zod";

const envSchema = z.object({
  PORT: z
    .string()
    .default("8080")
    .transform((v) => parseInt(v)),
  PUBLIC_URL: z.string(),
  MONGODB_URL: z.string(),
});

export const env = envSchema.parse(process.env);
