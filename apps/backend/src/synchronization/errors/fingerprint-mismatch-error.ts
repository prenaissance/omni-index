export class FingerprintMismatchError extends Error {
  constructor() {
    super("Fingerprint mismatch");
  }
}
