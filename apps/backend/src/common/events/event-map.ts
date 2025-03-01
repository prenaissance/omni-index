import {
  CommentLikeRemovedEvent,
  CommentLikedEvent,
} from "~/media/comments/events";
import {
  EntryCreatedEvent,
  EntryDeletedEvent,
  EntryUpdatedEvent,
} from "~/media/events/entry-events";

export type EventMap = {
  "entry.created": EntryCreatedEvent;
  "entry.deleted": EntryDeletedEvent;
  "entry.updated": EntryUpdatedEvent;
  "comment.liked": CommentLikedEvent;
  "comment.like-removed": CommentLikeRemovedEvent;
};

export type EventType = keyof EventMap;
