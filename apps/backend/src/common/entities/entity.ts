import { ObjectId } from "mongodb";

export type EntityInit = {
  _id?: ObjectId | string;
};

export abstract class Entity {
  readonly _id: ObjectId;

  constructor({ _id }: EntityInit) {
    this._id = new ObjectId(_id);
  }
}
