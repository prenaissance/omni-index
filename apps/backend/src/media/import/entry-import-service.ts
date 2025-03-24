import fs from "node:fs/promises";
import { FastifyBaseLogger } from "fastify";
import { EntryRepository } from "../repositories/entry-repository";
import { Entry } from "../entities";
import { EntryExportResponse } from "../exports/payloads";
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

    const { appVersion, entries, exportedAt } = jsonImport;

    this.logger.info({
      msg: "Importing entries from a file export.",
      appVersion,
      exportedAt,
    });
    for (const document of entries) {
      const entry = Entry.fromDocument(document);
      if (await this.entryRepository.hasSlug(entry.slug)) {
        this.logger.warn({
          msg: `Imported entry from file already exists`,
          slug: entry.slug,
        });
        continue;
      }

      await this.entryRepository.save(entry);
      this.logger.info({
        msg: "Imported entry from file",
        slug: entry.slug,
      });
    }
  }

  private async importUrl(url: string) {
    // this should be streamed in the future
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch the URL: ${url}`);
    }

    const jsonImport = (await response.json()) as EntryExportResponse;
    if (!isJsonExport(jsonImport)) {
      throw new Error("The JSON file is not a valid export.");
    }

    const { appVersion, entries, exportedAt } = jsonImport;

    this.logger.info({
      msg: "Importing entries from another node",
      url,
      appVersion,
      exportedAt,
    });
    for (const document of entries) {
      const entry = Entry.fromDocument(document);
      if (await this.entryRepository.hasSlug(entry.slug)) {
        this.logger.warn({
          msg: `Imported entry from another node already exists`,
          slug: entry.slug,
        });
        continue;
      }

      await this.entryRepository.save(entry);
      this.logger.info({
        msg: "Imported entry from another node",
        slug: entry.slug,
      });
    }
  }

  async init() {
    const importInitialized = await this.configStorage.get<boolean>(
      ENTRY_IMPORT_INITIALIZED
    );
    if (importInitialized) {
      this.logger.info(
        "Entry import already initialized. Skipping import attempts."
      );
      return;
    }
    const importSource = this.env.INIT_IMPORT_SOURCE!;
    const importType = parseImportType(importSource);
    if (importType == ImportSourceType.MISSING) {
      this.logger.info(
        "No import source specified. Skipping the import initialization. Clear the configuration collection to re-enable the import."
      );
    } else if (importType === ImportSourceType.UNKNOWN) {
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
          `The path specified in INIT_IMPORT_SOURCE does not match a file: ${importSource}`
        );
      }
      await this.importFile(importSource);
    } else if (importType === ImportSourceType.URL) {
      await this.importUrl(importSource);
    }

    await this.configStorage.set(ENTRY_IMPORT_INITIALIZED, true);
  }
}
