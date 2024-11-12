import { z } from "zod";

const envSchema = z.object({
  PORT: z
    .string()
    .default("8080")
    .transform((v) => parseInt(v)),
  PUBLIC_URL: z.string(),
  MONGODB_URL: z.string(),
  FRONTEND_URL: z.string().url(),
  SECRET_KEY: z
    .string()
    .min(32, "The secret key must be at least 32 characters long"),
});

export const env = envSchema.parse(process.env);
