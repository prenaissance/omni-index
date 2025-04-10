import { ObjectId } from "mongodb";
import { FastifyBaseLogger } from "fastify";
import { isGossipEvent } from "./entities/gossip-event";
import { StoredEvent } from "./entities/stored-event";
import { StoredEventRepository } from "./stored-event-repository";
import { DomainEventEmitter } from "~/common/events/typed-event-emitter";
import { DomainEvent, EventType } from "~/common/events/event-map";

export class StoredEventService implements Disposable {
  private unsubscribe?: () => void;
  constructor(
    private readonly storedEventRepository: StoredEventRepository,
    private readonly eventEmitter: DomainEventEmitter,
    private readonly logger: FastifyBaseLogger
  ) {}

  async init() {
    const callback = async (_: EventType, event: DomainEvent) => {
      const shouldBeStored = isGossipEvent(event);
      if (!shouldBeStored) {
        return;
      }

      await this.storedEventRepository.add(
        new StoredEvent({
          _id: new ObjectId(event.id),
          type: event.type,
          payload: event.payload,
        })
      );
      this.logger.debug({
        msg: "Stored gossip event created by this node",
        eventId: event.id,
        eventType: event.type,
      });
    };
    this.eventEmitter.onAny(callback);

    this.unsubscribe = () => {
      this.eventEmitter.offAny(callback);
    };
  }

  [Symbol.dispose]() {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
  }
}
