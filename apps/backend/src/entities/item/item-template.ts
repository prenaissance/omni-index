import { ObjectId } from "@fastify/mongodb";
import { Type } from "@sinclair/typebox";

enum Rarity {}

export const ITEM_TEMPLATES_COLLECTION = "item-templates";

export type ItemTemplate = {
  _id: ObjectId;
  name: string;
  game: {
    name: string;
    logoUrl: string;
  };
  rarity: Rarity;
  imageUrl: string;
  description: string;
};

export const ItemTemplateSchema = Type.Object({
  _id: Type.String(),
  name: Type.String(),
  game: Type.Object({
    name: Type.String(),
    logoUrl: Type.String(),
  }),
  rarity: Type.Enum(Rarity),
  imageUrl: Type.String(),
  description: Type.String(),
});
