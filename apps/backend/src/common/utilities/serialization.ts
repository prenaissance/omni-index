import { WithoutId } from "mongodb";
import { Entity, EntityInit } from "../entities/entity";

export type DocumentLike<T extends Entity> = WithoutId<T> &
  EntityInit & {
    [K in keyof T]: T[K] extends Entity ? DocumentLike<T[K]> : T[K];
  };
