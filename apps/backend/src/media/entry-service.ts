import { FastifyBaseLogger } from "fastify";
import { ObjectId } from "mongodb";
import { EntryRepository } from "./repositories/entry-repository";
import {
  EntryCreatedEvent,
  EntryDeletedEvent,
  EntryUpdatedEvent,
} from "./events/entry";
import { CreateEntryRequest } from "./payloads/entry/create-entry-request";
import { Entry } from "./entities";
import { DomainEventEmitter } from "~/common/events/typed-event-emitter";
import { omit } from "~/common/utilities/functional";

export class EntryService {
  constructor(
    private readonly entryRepository: EntryRepository,
    private readonly eventEmitter: DomainEventEmitter,
    private readonly logger: FastifyBaseLogger
  ) {}

  async createEntry(payload: CreateEntryRequest) {
    const entry = Entry.fromDocument(payload);
    await this.entryRepository.create(entry);
    this.eventEmitter.emit("entry.created", {
      id: new ObjectId(),
      type: "entry.created",
      payload: { entry: omit(entry, ["slug"]) },
    });

    return entry;
  }

  async updateEntry(entry: Entry) {
    const existingEntry = await this.entryRepository.findOne(entry._id);
    if (!existingEntry) {
      throw new Error("Entry not found");
    }
    const { fieldsDiff, createdMedia, deletedMediaIds, mediaUpdates } =
      entry.diff(existingEntry);
    const {} = this.eventEmitter.emit("entry.updated", {
      id: new ObjectId(),
      type: "entry.updated",
      payload: {
        entryId: entry._id,
        fields: fieldsDiff,
        deletedMediaIds: deletedMediaIds.map(ObjectId.createFromHexString),
        createdMedia,
        mediaUpdates,
      },
    });
  }

  async deleteEntry(id: ObjectId) {
    const deleted = await this.entryRepository.delete(id);
    if (!deleted) {
      return;
    }
    this.eventEmitter.emit("entry.deleted", {
      id: new ObjectId(),
      type: "entry.deleted",
      payload: { entryId: id },
    });
  }

  async synchronizeCreation(event: EntryCreatedEvent) {}
  async synchronizeUpdate(event: EntryUpdatedEvent, nodeUrl: string) {}
  async synchronizeDeletion(event: EntryDeletedEvent) {}
}
