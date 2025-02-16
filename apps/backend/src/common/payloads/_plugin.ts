import { fastifyPlugin } from "fastify-plugin";
import { MetadataSchema } from "./metadata-schema";
import { ExceptionSchema } from "./exception-schema";
import { PaginationQuery } from "./pagination/pagination-query";
import { AtprotoDeletionResponse } from "./atproto-deletion-response";

export const COMMON_PAYLOADS_PLUGIN = "common-payloads";

export const commonPayloadsPlugin = fastifyPlugin(
  (app) => {
    app.addSchema(MetadataSchema);
    app.addSchema(ExceptionSchema);

    app.addSchema(PaginationQuery);

    app.addSchema(AtprotoDeletionResponse);
  },
  {
    name: COMMON_PAYLOADS_PLUGIN,
  }
);
