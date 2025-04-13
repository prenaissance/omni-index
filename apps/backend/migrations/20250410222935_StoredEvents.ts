import { Db } from "mongodb";
import { MigrationInterface } from "mongo-migrate-ts";
import { StoredEvent } from "~/stored-events/entities/stored-event";
import { STORED_EVENTS_COLLECTION } from "~/stored-events/stored-event-repository";

export class StoredEvents20250410222935 implements MigrationInterface {
  public async up(db: Db): Promise<void | never> {
    const storedEvents = await db.createCollection<StoredEvent>(
      STORED_EVENTS_COLLECTION
    );
    await storedEvents.createIndex(
      { createdAt: -1 },
      { expireAfterSeconds: 24 * 60 * 60 }
    );
  }

  public async down(db: Db): Promise<void | never> {
    await db.dropCollection(STORED_EVENTS_COLLECTION);
  }
}
