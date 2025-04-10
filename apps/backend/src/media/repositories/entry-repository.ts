import { Collection, Db, ObjectId } from "mongodb";
import { Entry } from "../entities";
import { EntryUpdatedEvent } from "../events/entry";
import { DomainEventEmitter } from "~/common/events/typed-event-emitter";
import { PaginatedSearch } from "~/common/types/paginated-search";
import { omit } from "~/common/utilities/functional";

export class EntryRepository {
  private readonly collection: Collection<Entry>;
  constructor(
    private readonly db: Db,
    private readonly eventEmitter: DomainEventEmitter
  ) {
    this.collection = Entry.getCollection(db);
  }

  async has(id: ObjectId) {
    const count = await this.collection.countDocuments({ _id: id });
    return !!count;
  }

  async hasSlug(slug: string) {
    const count = await this.collection.countDocuments({ slug });
    return !!count;
  }

  async findOne(id: ObjectId) {
    const document = await this.collection.findOne({ _id: id });
    if (!document) {
      return null;
    }
    return Entry.fromDocument(document);
  }

  async findMany({ skip, limit }: PaginatedSearch) {
    const documents = await this.collection
      .find({})
      .skip(skip)
      .limit(limit)
      .toArray();
    const total = await this.collection.countDocuments();
    const entries = documents.map(Entry.fromDocument);
    return {
      entries,
      total,
    };
  }

  async save(entry: Entry) {
    const existingEntry = await this.collection.findOne({ _id: entry._id });
    if (!existingEntry) {
      await this.collection.insertOne(entry);
      this.eventEmitter.emit("entry.created", {
        id: new ObjectId(),
        type: "entry.created",
        payload: { entry: omit(entry, ["slug"]) },
      });
      return;
    }

    const existingMediaIds = new Set(
      existingEntry.media.map((m) => m._id.toString())
    );
    const newMediaIds = new Set(entry.media.map((m) => m._id.toString()));
    const deletedMediaIds = existingMediaIds.difference(newMediaIds);
    const addedMediaIds = newMediaIds.difference(existingMediaIds);
    const remainingMediaIds = newMediaIds.intersection(existingMediaIds);

    const updatedMedia = entry.media
      .filter((media) => remainingMediaIds.has(media._id.toString()))
      .filter((media) => {
        const existingMedia = existingEntry.media.find((m) =>
          m._id.equals(media._id)
        );
        return existingMedia && !media.equals(existingMedia);
      });

    const mediaUpdates: EntryUpdatedEvent["payload"]["mediaUpdates"] =
      updatedMedia.map((media) => {
        const existingMedia = existingEntry.media.find((m) =>
          m._id.equals(media._id)
        )!;
        const existingMirrors = new Set(
          existingMedia.mirrors.map((m) => m._id)
        );
        const newMirrors = new Set(media.mirrors.map((m) => m._id));
        const deletedMirrorIds = existingMirrors.difference(newMirrors);
        const createdMirrorIds = newMirrors.difference(existingMirrors);
        return {
          mediaId: media._id,
          meta: media.metaDiff(existingMedia),
          createdMirrors: media.mirrors.filter((m) =>
            createdMirrorIds.has(m._id)
          ),
          deletedMirrorIds: Array.from(deletedMirrorIds),
        };
      });

    const fields = entry.diff(existingEntry);
    const hasChanges =
      Object.keys(fields).length > 0 ||
      mediaUpdates.length > 0 ||
      deletedMediaIds.size > 0 ||
      addedMediaIds.size > 0;

    if (!hasChanges) {
      return;
    }

    await this.collection.updateOne(
      { _id: entry._id },
      {
        $set: {
          ...fields,
          updatedAt: new Date(),
          media: entry.media,
        },
      }
    );

    this.eventEmitter.emit("entry.updated", {
      id: new ObjectId(),
      type: "entry.updated",
      payload: {
        entryId: entry._id,
        fields,
        deletedMediaIds: Array.from(deletedMediaIds).map(
          ObjectId.createFromHexString
        ),
        createdMedia: entry.media.filter((m) =>
          addedMediaIds.has(m._id.toString())
        ),
        mediaUpdates,
      },
    });
  }

  async delete(id: ObjectId) {
    const result = await this.collection.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return false;
    }

    this.eventEmitter.emit("entry.deleted", {
      id: new ObjectId(),
      type: "entry.deleted",
      payload: { entryId: id },
    });
  }
}
