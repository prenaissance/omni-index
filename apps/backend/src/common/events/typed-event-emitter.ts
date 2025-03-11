// eslint-disable-next-line import-x/no-named-as-default
import EventEmitter2 from "eventemitter2";
import { MatchesPattern } from "../types/strings";
import { EventMap } from "./event-map";

export class TypedEventEmitter<Events extends Record<string, object>> {
  constructor(
    private readonly eventEmitter: EventEmitter2 = new EventEmitter2({
      wildcard: true,
    })
  ) {}

  emit<K extends keyof Events>(event: K, payload: Events[K]) {
    return this.eventEmitter.emit(event as string, payload);
  }

  on<K extends keyof Events>(event: K, listener: (payload: Events[K]) => void) {
    return this.eventEmitter.on(event as string, listener);
  }

  onPattern<Pattern extends string>(
    pattern: Pattern,
    listener: (
      payload: Events[MatchesPattern<Pattern, keyof Events & string>]
    ) => void
  ) {
    return this.eventEmitter.on(pattern, listener);
  }

  offPattern<Pattern extends string>(
    pattern: Pattern,
    listener: (
      payload: Events[MatchesPattern<Pattern, keyof Events & string>]
    ) => void
  ) {
    return this.eventEmitter.off(pattern, listener);
  }

  once<K extends keyof Events>(
    event: K,
    listener: (payload: Events[K]) => void
  ) {
    return this.eventEmitter.once(event as string, listener);
  }

  off<K extends keyof Events>(
    event: K,
    listener: (payload: Events[K]) => void
  ) {
    return this.eventEmitter.off(event as string, listener);
  }

  removeAllListeners(): this;
  removeAllListeners<K extends keyof Events>(event: K): this;
  removeAllListeners<K extends keyof Events>(event?: K) {
    this.eventEmitter.removeAllListeners(event as string);
    return this;
  }
}

export type DomainEventEmitter = TypedEventEmitter<EventMap>;
