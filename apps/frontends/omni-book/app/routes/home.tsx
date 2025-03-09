import { useLoaderData } from "react-router";
import type { Route } from "./+types/home";
import Trending from "~/components/trending";
import Hero from "~/components/hero";
import { env } from "~/lib/env";
import type { paths } from "~/lib/api-types";

type BooksResponseType =
  paths["/api/entries"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Omni Book Application" },
    { name: "description", content: "Welcome to Omni Book!" },
  ];
}

export const loader = async () => {
  const response = await fetch(`${env.VITE_API_URL}/api/entries`);

  if (!response.ok) {
    throw new Response(JSON.stringify({ error: "Books not found" }), {
      status: 404,
    });
  }

  const books = await response.json();
  return books.data as BooksResponseType;
};

export default function Home() {
  const loaderData: BooksResponseType = useLoaderData();

  return (
    <div>
      <Hero />
      <Trending loaderData={loaderData} />
    </div>
  );
}
