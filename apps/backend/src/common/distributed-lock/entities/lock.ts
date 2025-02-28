export type LockInit = {
  name: string;
  ttlSeconds: number;
};

export class Lock {
  readonly _id: string;
  readonly expiresAt: Date;

  constructor(init: LockInit) {
    this._id = init.name;
    this.expiresAt = new Date(Date.now() + init.ttlSeconds * 1000);
  }
}
