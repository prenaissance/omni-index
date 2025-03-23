import { EntryExportResponse } from "../exports/payloads";
import { ImportSourceType } from "./enum/import-source-type";

export const parseImportType = (importSource: string): ImportSourceType => {
  if (!importSource) return ImportSourceType.MISSING;
  // unix & Windows file path regex
  if (/^([a-zA-Z]:\\|\/)/.test(importSource)) {
    return ImportSourceType.FILE;
  }
  try {
    new URL(importSource);
    return ImportSourceType.URL;
  } catch {
    /* empty */
  }

  return ImportSourceType.UNKNOWN;
};

export const isJsonExport = (data: unknown): data is EntryExportResponse => {
  return (
    typeof data === "object" &&
    data !== null &&
    "appVersion" in data &&
    "exportedAt" in data &&
    "entries" in data &&
    Array.isArray(data.entries)
  );
};
