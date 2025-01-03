import { StringOptions, Type } from "@sinclair/typebox";
import { ObjectId } from "mongodb";

export const ObjectIdSchema = (stringOptions?: StringOptions) =>
  Type.Unsafe<ObjectId>({
    type: "string",
    examples: ["5fdedb7c25ab1352eef88f60"],
    pattern: "^[0-9a-fA-F]{24}$",
    description: "ObjectId",
    ...stringOptions,
  });
