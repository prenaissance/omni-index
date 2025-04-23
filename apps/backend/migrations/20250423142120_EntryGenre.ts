import { Db } from "mongodb";
import { MigrationInterface } from "mongo-migrate-ts";
import { Entry, ENTRY_COLLECTION } from "~/media/entities";

export class EntryGenre20250423142120 implements MigrationInterface {
  public async up(db: Db): Promise<void | never> {
    const entries = db.collection<Entry>(ENTRY_COLLECTION);
    await entries.createIndex({ genre: 1 });
  }

  public async down(db: Db): Promise<void | never> {
    const entries = db.collection<Entry>(ENTRY_COLLECTION);
    await entries.dropIndex("genre_1");
  }
}
