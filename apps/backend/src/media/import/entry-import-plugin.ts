import { fastifyPlugin } from "fastify-plugin";
import { MEDIA_PLUGIN } from "../_plugin";
import { EntryImportService } from "./entry-import-service";
import { CONFIG_PLUGIN } from "~/common/config/config-plugin";
import { ENV_PLUGIN } from "~/common/config/env-plugin";

export const ENTRY_IMPORT_PLUGIN = "entry-import";

export const entryImportPlugin = fastifyPlugin(
  async (app) => {
    const entryImportService = new EntryImportService(
      app.mediaEntry.repository,
      app.config.storage,
      app.env,
      app.log
    );

    app.addHook("onReady", async () => {
      await entryImportService.init();
    });
  },

  {
    name: ENTRY_IMPORT_PLUGIN,
    dependencies: [MEDIA_PLUGIN, CONFIG_PLUGIN, ENV_PLUGIN],
  }
);
