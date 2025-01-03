import { Type } from "@sinclair/typebox";

export const ExceptionSchema = Type.Object(
  {
    message: Type.String({
      description: "Exception message",
    }),
    data: Type.Optional(Type.Any()),
  },
  {
    $id: "Exception",
  }
);
