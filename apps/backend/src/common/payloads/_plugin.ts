import { fastifyPlugin } from "fastify-plugin";
import { MetadataSchema } from "./metadata";

export const commonPayloadsPlugin = fastifyPlugin((app) => {
  app.addSchema(MetadataSchema);
});
