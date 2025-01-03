import { ObjectId } from "mongodb";
import { Entry, Index, Media } from "../entities";

export type EntryCreatedEvent = {
  entry: Entry;
};

export type EntryDeletedEvent = {
  entryId: ObjectId;
};

export type EntryUpdatedEvent = {
  entryId: ObjectId;
  fields: Partial<Omit<Entry, "_id" | "createdAt" | "slug" | "media">>;
  deletedMediaIds: ObjectId[];
  createdMedia: Media[];
  mediaUpdates: {
    mediaId: ObjectId;
    fields: Partial<Omit<Media, "_id" | "createdAt" | "mirrors">>;
    createdMirrors: Index[];
    deletedMirrorIds: ObjectId[];
  };
};
