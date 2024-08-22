import { ObjectId } from "@fastify/mongodb";
import { ItemTemplate } from "./item-template";

export const ITEMS_COLLECTION = "items";

export type Item = {
  _id?: ObjectId;
  userId: string;
  templateId: ObjectId;
  stacks?: number;
  order: number;
};

export type PopulatedItem = Item & {
  template: ItemTemplate;
};
