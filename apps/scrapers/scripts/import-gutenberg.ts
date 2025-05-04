import asserts from "node:assert";
import type { CreateEntryRequest } from "~/backend/media/payloads/entry/create-entry-request";
import { gutenbergToEntry, GutendexBook } from "~/common/gutenberg";

const args = process.argv.slice(2);
const id = args[0];
asserts.ok(id, "The Gutenberg id is required to be passed as an argument");
asserts.ok(
  process.env.SESSION,
  "session is required to be set as an environment variable"
);

const url = `https://gutendex.com/books/${id}`;
const response = await fetch(url);
const book = (await response.json()) as GutendexBook;

const entry: CreateEntryRequest = await gutenbergToEntry(book);

const omniIndexUrl = process.env.OMNI_INDEX_URL || "http://localhost:8080";

const createResponse = await fetch(`${omniIndexUrl}/api/entries`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    session: process.env.SESSION,
  },
  body: JSON.stringify(entry),
});

if (createResponse.ok) {
  console.log("Entry created successfully");
} else {
  console.error(`Failed to create entry: ${createResponse.status}`);
  console.error(await createResponse.text());
  process.exit(1);
}
