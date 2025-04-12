import { FastifyBaseLogger } from "fastify";
import { ObjectId } from "mongodb";
import { EntryRepository } from "./repositories/entry-repository";
import {
  EntryCreatedEvent,
  EntryDeletedEvent,
  EntryUpdatedEvent,
} from "./events/entry";
import { CreateEntryRequest } from "./payloads/entry/create-entry-request";
import { Entry, Media } from "./entities";
import { EntrySchema } from "./payloads/entry/entry-schema";
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
    this.eventEmitter.emit("entry.updated", {
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

  async synchronizeCreation(event: EntryCreatedEvent, nodeUrl: string) {
    const entry = Entry.fromDocument(event.payload.entry);
    this.logger.info("Synchronizing entry creation", {
      id: entry._id,
      slug: entry.slug,
      nodeUrl,
    });
    try {
      await this.entryRepository.create(entry);
      this.eventEmitter.emit("entry.created", event);
    } catch (error) {
      this.logger.error("Error synchronizing entry creation", {
        entryId: entry._id,
        nodeUrl,
        error,
      });
    }
  }
  private async importFullEntry(entryId: ObjectId, nodeUrl: string) {
    const response = await fetch(`${nodeUrl}/api/entries/${entryId}`);
    const data: EntrySchema = await response.json();
    if (!response.ok) {
      this.logger.error("Error fetching entry from node", {
        entryId,
        nodeUrl,
        error: data,
      });
      return false;
    }

    const entry = Entry.fromDocument(data);
    this.entryRepository.create(entry);
  }
  async synchronizeUpdate(event: EntryUpdatedEvent, nodeUrl: string) {
    const entryId = event.payload.entryId;
    const entry = await this.entryRepository.findOne(entryId);
    if (!entry) {
      this.logger.warn({
        msg: "Entry update event received for non-existing entry. Fetching full entry from node",
        entryId,
        nodeUrl,
      });
      const success = await this.importFullEntry(entryId, nodeUrl);
      if (success) {
        this.eventEmitter.emit("entry.updated", event);
      }
      return;
    }

    const { fields, createdMedia, deletedMediaIds, mediaUpdates } =
      event.payload;
    Object.assign(entry, fields);
    entry.media = entry.media.filter(
      (media) =>
        !deletedMediaIds
          .map((id) => id.toString())
          .includes(media._id.toString())
    );
    entry.media.push(...createdMedia.map(Media.fromDocument));
    for (const mediaUpdate of mediaUpdates) {
      const media = entry.media.find(
        (m) => m._id.toString() === mediaUpdate.mediaId.toString()
      );
      if (media) {
        Object.assign(media, mediaUpdate);
      }
    }
    this.logger.info("Synchronizing entry update", {
      id: entry._id,
      slug: entry.slug,
      nodeUrl,
    });
    await this.entryRepository.update(entry);
    this.eventEmitter.emit("entry.updated", event);
  }

  async synchronizeDeletion(event: EntryDeletedEvent, nodeUrl: string) {
    this.logger.info("Synchronizing entry deletion", {
      entryId: event.payload.entryId,
      nodeUrl,
    });
    await this.entryRepository.delete(event.payload.entryId);
    this.eventEmitter.emit("entry.deleted", event);
  }
}
