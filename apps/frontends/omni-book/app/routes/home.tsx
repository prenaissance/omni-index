import type { Route } from "./+types/home";
import Trending from "~/components/trending";
import Hero from "~/components/hero";
import { env } from "~/lib/env";
import type { paths } from "~/lib/api-types";
import Latest from "~/components/latest";

type LatestQuery = paths["/api/entries"]["get"]["parameters"]["query"];

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Omni Book Application" },
    { name: "description", content: "Welcome to Omni Book!" },
  ];
}

export const loader = async () => {
  const trendingQuery = {
    page: 1,
    limit: 7,
  };

  const trendingSearchParams = new URLSearchParams(trendingQuery as never);

  const trendingResponse = await fetch(
    `${env.API_URL}/api/entries?${trendingSearchParams}`
  );

  if (!trendingResponse.ok) {
    throw new Response(JSON.stringify({ error: "Trending books not found" }), {
      status: 404,
    });
  }

  const trendingBooks = await trendingResponse.json();

  const latestQuery = {
    page: 1,
    limit: 7,
    orderBy: "createdAt",
  } satisfies LatestQuery;

  const latestSearchParams = new URLSearchParams(latestQuery as never);

  const latestResponse = await fetch(
    `${env.API_URL}/api/entries?${latestSearchParams}`
  );

  if (!latestResponse.ok) {
    throw new Response(JSON.stringify({ error: "Latest books not found" }), {
      status: 404,
    });
  }

  const latestBooks = await latestResponse.json();

  return { trendingBooks, latestBooks };
};

export default function Home({ loaderData }: Route.ComponentProps) {
  const { trendingBooks, latestBooks } = loaderData;

  return (
    <div>
      <Hero />
      <Trending trendingBooks={trendingBooks.data} />
      <div className="bg-card-secondary h-[2px] rounded-lg mx-14"></div>
      <Latest latestBooks={latestBooks.data} />
    </div>
  );
}
