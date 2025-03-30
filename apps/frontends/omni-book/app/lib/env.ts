import { z } from "zod";
import { isServer } from "./utils";

const envSchema = z.object({
  API_URL: z.string().url(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});
export const env = {} as z.infer<typeof envSchema>;
if (process.env.SKIP_ENVIRONMENT_CHECK !== "true" && isServer()) {
  const parsedEnv = envSchema.parse(process.env);
  Object.assign(env, parsedEnv);
}
