import fs from "node:fs/promises";
import { FastifyBaseLogger } from "fastify";
import { EntryRepository } from "../repositories/entry-repository";
import { ImportSourceType } from "./enum/import-source-type";
import { isJsonExport, parseImportType } from "./utilities";
import { Env } from "~/common/config/env";
import { ConfigStorage } from "~/common/config/config-storage";

const ENTRY_IMPORT_INITIALIZED = "ENTRY_IMPORT_INITIALIZED";

export class EntryImportService {
  constructor(
    private readonly entryRepository: EntryRepository,
    private readonly configStorage: ConfigStorage,
    private readonly env: Env,
    private readonly logger: FastifyBaseLogger
  ) {}

  private async importFile(path: string) {
    // this should be streamed in the future
    const file = await fs.readFile(path, "utf-8");
    const jsonImport = JSON.parse(file);
    if (!isJsonExport(jsonImport)) {
      throw new Error("The JSON file is not a valid export.");
    }

    // WIP
  }

  private async importUrl(url: string) {
    // this should be streamed in the future
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch the URL: ${url}`);
    }

    const jsonImport = await response.json();
    if (!isJsonExport(jsonImport)) {
      throw new Error("The JSON file is not a valid export.");
    }

    // WIP
  }

  async init() {
    const importInitialized = await this.configStorage.get<boolean>(
      ENTRY_IMPORT_INITIALIZED
    );
    if (importInitialized) {
      return;
    }
    const importSource = this.env.INIT_IMPORT_SOURCE!;
    const importType = parseImportType(importSource);
    if (importType === ImportSourceType.UNKNOWN) {
      throw new Error(
        "Could not parse the import type as neither a file nor a URL. Check the INIT_IMPORT_SOURCE environment variable."
      );
    } else if (importType === ImportSourceType.FILE) {
      const exists = await fs
        .access(importSource)
        .then(() => true)
        .catch(() => false);
      if (!exists) {
        throw new Error(
          `The file specified in INIT_IMPORT_SOURCE does not exist: ${importSource}`
        );
      }

      const isFile = await fs
        .stat(importSource)
        .then((stats) => stats.isFile())
        .catch(() => false);
      if (!isFile) {
        throw new Error(
          `The path specified in INIT_IMPORT_SOURCE is not a file: ${importSource}`
        );
      }
      await this.importFile(importSource);
    } else if (importType === ImportSourceType.URL) {
      await this.importUrl(importSource);
    }

    await this.configStorage.set(ENTRY_IMPORT_INITIALIZED, true);
  }
}
