import { retry, timer } from "rxjs";

export type RetryWithBackoffOptions = {
  minDelay?: number;
  maxDelay?: number;
};

const jitter = 1000;
const randomJitter = () => Math.floor(Math.random() * jitter);

export const retryWithBackoff = <T>(options?: RetryWithBackoffOptions) => {
  const minDelay = options?.minDelay ?? 1000;
  const maxDelay = options?.maxDelay ?? 60_000;

  return retry<T>({
    delay: (_error, retryCount) =>
      timer(Math.min(minDelay * 2 ** retryCount, maxDelay) + randomJitter()),
    resetOnSuccess: true,
  });
};
