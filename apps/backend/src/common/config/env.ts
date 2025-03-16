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
  FRONTEND_URL: z.string().url(),
  CALLBACK_URL: z.string().url(),
  DANGEROUS_SKIP_IDENTITY_VERIFICATION: z
    .string()
    .transform((v) => v === "true"),
  INIT_SESSION_SECRET: z
    .string()
    .min(32, "The secret key must be at least 32 characters long")
    .or(z.string().default(""))
    .transform((v) => v || undefined)
    .optional(),
  INIT_ADMIN_IDENTITY: z
    .string()
    // TLD lenient regex
    .regex(
      /[a-zA-Z0-9-]{1,63}(\.[a-zA-Z0-9-]{1,63}){1,}/,
      "The identity must be a valid handle or a DID"
    )
    .or(
      z
        .string()
        .regex(
          /^did:plc:.{24}$/,
          "The identity must be a valid handle or a DID"
        )
    ),
});

export type Env = z.infer<typeof envSchema>;
