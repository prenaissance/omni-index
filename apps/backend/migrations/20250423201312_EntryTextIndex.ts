import { Db } from "mongodb";
import { MigrationInterface } from "mongo-migrate-ts";
import { Entry, ENTRY_COLLECTION } from "~/media/entities";

export class EntryTextIndex20250423201312 implements MigrationInterface {
  public async up(db: Db): Promise<void | never> {
    const entries = db.collection<Entry>(ENTRY_COLLECTION);
    await entries.createIndex(
      {
        title: "text",
        description: "text",
        author: "text",
      },
      {
        name: "text_idx",
        language_override: "en",
        weights: {
          title: 10,
          description: 5,
          author: 10,
        },
      }
    );
    await entries.createIndex({
      createdAt: -1,
    });
  }

  public async down(db: Db): Promise<void | never> {
    const entries = db.collection<Entry>(ENTRY_COLLECTION);
    await entries.dropIndex("text_idx");
    await entries.dropIndex("createdAt_-1");
  }
}
