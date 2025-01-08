import { StringOptions, Type } from "@sinclair/typebox";

export const DateSchema = (options?: StringOptions) =>
  Type.Unsafe<Date>(Type.String({ format: "date-time", ...options }));
