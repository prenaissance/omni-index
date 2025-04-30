import asserts from "node:assert";
import { CreateEntryRequest } from "~/backend/media/payloads/entry/create-entry-request";
import { gutenbergToEntry, GutendexBook } from "~/common/gutenberg";

type GutendexBatch = {
  count: number;
  next: string | null;
  previous: string | null;
  results: GutendexBook[];
};

const args = process.argv.slice(2);
let startPage = args[0];
let endPage = args[1];
if (!endPage) {
  endPage = startPage;
  startPage = "1";
}
if (!endPage) {
  console.error(
    "Usage: pnpm import:gutenberg:batch <startOrEndPage> [endPage]"
  );
}
asserts.ok(
  process.env.SESSION,
  "session is required to be set as an environment variable"
);

const omniIndexUrl = process.env.OMNI_INDEX_URL || "http://localhost:8080";

const importBatch = async (page: number) => {
  const url = new URL("https://gutendex.com/books");
  url.searchParams.set("sort", "popularity");
  url.searchParams.set("page", page.toString());

  const response = await fetch(url);
  const batch = (await response.json()) as GutendexBatch;

  const created: string[] = [];

  for (const book of batch.results) {
    const entry: CreateEntryRequest = await gutenbergToEntry(book);

    const createResponse = await fetch(`${omniIndexUrl}/api/entries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        session: process.env.SESSION!,
      },
      body: JSON.stringify(entry),
    });

    if (!createResponse.ok) {
      if (createResponse.status === 409) {
        console.log(`Entry ${entry.title} already exists`);
      } else {
        console.error(`Failed to create entry: ${createResponse.status}`);
        console.error(await createResponse.json());
      }
    } else {
      created.push(entry.title);
    }

    await createResponse.body?.cancel();
  }

  console.log(
    `Page ${page} processed. Created entries: ${created
      .map((value) => `"${value}"`)
      .join(", ")}`
  );
};

for (let page = Number(startPage); page <= Number(endPage); page++) {
  await importBatch(page);
}
