import { Db } from "mongodb";
import { MigrationInterface } from "mongo-migrate-ts";
import { STORED_EVENTS_COLLECTION } from "~/stored-events/stored-event-repository";
import {
  StoredEvent,
  StoredEventStatus,
} from "~/stored-events/entities/stored-event";

export class StoredEventStatus20250430235311 implements MigrationInterface {
  public async up(db: Db): Promise<void | never> {
    const storedEvents = db.collection<StoredEvent>(STORED_EVENTS_COLLECTION);
    // For existing documents
    await storedEvents.updateMany(
      { status: { $exists: false } },
      { $set: { status: StoredEventStatus.Accepted } }
    );
  }

  public async down(db: Db): Promise<void | never> {
    const storedEvents = db.collection<StoredEvent>(STORED_EVENTS_COLLECTION);
    await storedEvents.updateMany({}, { $unset: { status: "" } });
  }
}
