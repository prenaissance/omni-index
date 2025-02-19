import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z
    .string()
    .default("8080")
    .transform((v) => parseInt(v)),
  MONGODB_URL: z.string(),
  MONGODB_DB: z.string(),
  API_URL: z.string(),
  FRONTEND_URL: z.string().url(),
  CALLBACK_URL: z.string().url(),
  INIT_SESSION_SECRET: z
    .string()
    .min(32, "The secret key must be at least 32 characters long")
    .optional(),
  DANGEROUS_SKIP_IDENTITY_VERIFICATION: z
    .string()
    .transform((v) => v === "true"),
});

export type Env = z.infer<typeof envSchema>;
