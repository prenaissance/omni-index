import { Static, Type } from "@sinclair/typebox";
import { EntryExportSchema } from "./entry-export-schema";
import packageJson from "~/../package.json" with { type: "json" };
import { DateSchema } from "~/common/payloads";

const { version } = packageJson;

export const EntryExportResponse = Type.Object(
  {
    appVersion: Type.String({ examples: [version] }),
    exportedAt: DateSchema(),
    entries: Type.Array(Type.Ref(EntryExportSchema)),
  },
  {
    $id: "EntryExportResponse",
  }
);
export type EntryExportResponse = Static<typeof EntryExportResponse>;
