import { Readable } from "node:stream";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import {
  EntryExportResponse,
  EntryExportSchema,
  IndexExportSchema,
  MediaExportSchema,
} from "~/media/exports/payloads";

const entryExportsRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.addSchema(IndexExportSchema);
  app.addSchema(MediaExportSchema);
  app.addSchema(EntryExportSchema);
  app.addSchema(EntryExportResponse);

  // TODO: make sure that this does not get fully loaded into memory due to validation or anything like that
  app.get(
    "/export",
    {
      schema: {
        tags: ["Exports"],
        security: [],
        response: {
          200: EntryExportResponse,
        },
      },
    },
    async (request, reply) => {
      const abortController = new AbortController();
      request.raw.on("abort", () => {
        abortController.abort();
      });

      const stream = Readable.from(
        app.mediaEntry.exports.service.exportAllEntries({
          signal: abortController.signal,
        })
      );
      return reply
        .type("application/json")
        .header(
          "content-disposition",
          `attachment; filename="omni-index_${new Date().toISOString()}.json"`
        )
        .send(stream as never);
    }
  );
};

export default entryExportsRoutes;
