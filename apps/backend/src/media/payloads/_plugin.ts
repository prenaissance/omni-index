import { fastifyPlugin } from "fastify-plugin";
import { BlobLinkSchema } from "~/media/payloads/blob-link-schema";
import { CreateEntryRequest } from "~/media/payloads/create-entry-request";
import { CreateIndexRequest } from "~/media/payloads/create-index-request";
import { CreateMediaRequest } from "~/media/payloads/create-media-request";
import { EntrySchema } from "~/media/payloads/entry-schema";
import { IndexSchema } from "~/media/payloads/index-schema";
import { MediaSchema } from "~/media/payloads/media-schema";

export const mediaPayloadsPlugin = fastifyPlugin((app) => {
  app.addSchema(BlobLinkSchema);
  app.addSchema(IndexSchema);
  app.addSchema(MediaSchema);
  app.addSchema(EntrySchema);

  app.addSchema(CreateIndexRequest);
  app.addSchema(CreateMediaRequest);
  app.addSchema(CreateEntryRequest);
});
