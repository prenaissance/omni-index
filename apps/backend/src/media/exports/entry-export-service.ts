import { Abortable } from "node:events";
import { Collection, Db } from "mongodb";
import { Entry, ENTRY_COLLECTION } from "../entities";
import packageJson from "~/../package.json" with { type: "json" };
import { indent } from "~/common/utilities/strings";
import { omit } from "~/common/utilities/functional";

const { version } = packageJson;

const JSON_STREAM_HEADER = `{
  "appVersion": "${version}",
  "exportedAt": "${new Date().toISOString()}",
  "entries": [
`;

const JSON_STREAM_FOOTER = `
  ]
}`;

export class EntryExportService {
  private readonly entries: Collection<Entry>;

  constructor(db: Db) {
    this.entries = db.collection(ENTRY_COLLECTION);
  }

  async *exportAllEntries({ signal }: Abortable) {
    const cursor = this.entries.find({}, { sort: { _id: 1 } });

    yield JSON_STREAM_HEADER;

    let first = true;
    for await (const entry of cursor) {
      if (signal?.aborted) {
        cursor.close();
        return;
      }
      const serialized = JSON.stringify(omit(entry, ["slug"]), null, 2);
      yield `${first ? "" : ",\n"}${indent(serialized, 4)}`;
      first = false;
    }

    yield JSON_STREAM_FOOTER;
  }
}
