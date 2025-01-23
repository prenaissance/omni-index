import { SwaggerOptions } from "@fastify/swagger";

export const swaggerConfig: SwaggerOptions = {
  swagger: {
    info: {
      title: "Fastify API",
      description: "Backend API for Inventory Manager",
      version: "0.1.0",
    },
  },
  openapi: {
    components: {
      securitySchemes: {
        session: {
          type: "apiKey",
          name: "session",
          in: "cookie",
        },
      },
    },
    security: [{ session: [] }],
  },
  refResolver: {
    buildLocalReference(json, _baseUri, _fragment, i) {
      if (!json.title && json.$id) {
        json.title = json.$id;
      }
      // Fallback if no $id is present
      if (!json.$id) {
        return `def-${i}`;
      }

      return `${json.$id}`;
    },
  },
};
