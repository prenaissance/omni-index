import { WithoutId } from "mongodb";
import { Entity, EntityInit } from "../entities/entity";

export type DocumentLike<T extends Entity> = WithoutId<T> &
  EntityInit & {
    [K in keyof T]: T[K] extends Entity ? DocumentLike<T[K]> : T[K];
  };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFn = (...args: any[]) => any;

export type ClassProperties<T extends Entity> = {
  [K in keyof T as T[K] extends AnyFn ? never : K]: T[K] extends Entity[]
    ? ClassProperties<T[K][number]>[]
    : T[K] extends Entity
      ? ClassProperties<T[K]>
      : T[K];
};
