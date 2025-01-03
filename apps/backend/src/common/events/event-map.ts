import {
  EntryCreatedEvent,
  EntryDeletedEvent,
  EntryUpdatedEvent,
} from "~/media/events/entry-events";

export type EventMap = {
  "entry.created": EntryCreatedEvent;
  "entry.deleted": EntryDeletedEvent;
  "entry.updated": EntryUpdatedEvent;
};

export type EventType = keyof EventMap;
