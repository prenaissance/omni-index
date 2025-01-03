import { fastifyPlugin } from "fastify-plugin";
import { COMMON_PAYLOADS_PLUGIN } from "~/common/payloads/_plugin";
import { BlobLinkSchema } from "~/media/payloads/blob-link-schema";
import { CreateEntryRequest } from "~/media/payloads/entry/create-entry-request";
import { CreateIndexRequest } from "~/media/payloads/index/create-index-request";
import { CreateMediaRequest } from "~/media/payloads/media/create-media-request";
import { EntrySchema } from "~/media/payloads/entry/entry-schema";
import { IndexSchema } from "~/media/payloads/index/index-schema";
import { MediaSchema } from "~/media/payloads/media/media-schema";

export const mediaPayloadsPlugin = fastifyPlugin(
  (app) => {
    app.addSchema(BlobLinkSchema);
    app.addSchema(IndexSchema);
    app.addSchema(MediaSchema);
    app.addSchema(EntrySchema);

    app.addSchema(CreateIndexRequest);
    app.addSchema(CreateMediaRequest);
    app.addSchema(CreateEntryRequest);
  },
  {
    dependencies: [COMMON_PAYLOADS_PLUGIN],
  }
);
