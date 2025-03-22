import { Db } from "mongodb";
import { MigrationInterface } from "mongo-migrate-ts";
import { ENTRY_COLLECTION } from "~/media/entities";

export class EntryUniqueness20250322215042 implements MigrationInterface {
  public async up(db: Db): Promise<void | never> {
    const entries = db.collection(ENTRY_COLLECTION);
    if (await entries.indexExists("slug_1")) {
      await entries.dropIndex("slug_1");
    }
    await entries.createIndex({ slug: 1 }, { unique: true });
  }

  public async down(db: Db): Promise<void | never> {
    const entries = db.collection(ENTRY_COLLECTION);
    await entries.dropIndex("slug_1");
    await entries.createIndex({ slug: 1 });
  }
}
