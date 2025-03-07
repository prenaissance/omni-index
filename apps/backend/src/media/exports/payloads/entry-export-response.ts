import { Type } from "@sinclair/typebox";
import { EntryExportSchema } from "./entry-export-schema";
import { version } from "~/../package.json";
import { DateSchema } from "~/common/payloads";

export const EntryExportResponse = Type.Object({
  appVersion: Type.String({ examples: [version] }),
  exportedAt: DateSchema(),
  entries: Type.Array(Type.Ref(EntryExportSchema)),
});
