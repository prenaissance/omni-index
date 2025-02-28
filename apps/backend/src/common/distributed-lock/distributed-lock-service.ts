import { Collection, Db } from "mongodb";
import { Lock, LockInit } from "./entities/lock";
export const LOCKS_COLLECTION = "locks";

export class DistributedLockService {
  private readonly locksCollection: Collection<Lock>;

  constructor(db: Db) {
    this.locksCollection = db.collection(LOCKS_COLLECTION);
  }

  async acquireLock(options: LockInit): Promise<boolean> {
    const lock = new Lock(options);
    try {
      await this.locksCollection.insertOne(lock);
      return true;
    } catch (error) {
      return false;
    }
  }

  async releaseLock(name: string): Promise<void> {
    await this.locksCollection.deleteOne({ _id: name });
  }

  async acquireAndExecute<T>(options: LockInit, fn: () => PromiseLike<T>) {
    const acquired = await this.acquireLock(options);
    if (!acquired) {
      throw new Error(`Failed to acquire lock ${options.name}`);
    }

    try {
      return await fn();
    } finally {
      await this.releaseLock(options.name);
    }
  }
}
