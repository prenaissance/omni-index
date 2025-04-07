import { Observable, retry, tap, timer } from "rxjs";

export type RetryWithBackoffOptions = {
  minDelay?: number;
  maxDelay?: number;
  jitter?: number;
};

export const retryWithBackoff = (options?: RetryWithBackoffOptions) => {
  const minDelay = options?.minDelay ?? 1000;
  let baseDelay = minDelay;
  const maxDelay = options?.maxDelay ?? 60_000;
  const jitter = options?.jitter ?? 1000;

  const randomJitter = () => Math.floor(Math.random() * jitter);

  return <T>(source: Observable<T>) =>
    source.pipe(
      tap(() => {
        baseDelay = minDelay;
      }),
      retry({
        delay: () => {
          const delay = baseDelay + randomJitter();
          baseDelay = Math.min(baseDelay * 2, maxDelay);
          return timer(delay);
        },
      })
    );
};
