import { env } from "../env";
import type { Route } from "./+types/client-metadata";

export const loader = async ({}: Route.LoaderArgs) => {
  return await fetch(`${env.API_URL}/client-metadata.json`);
};
