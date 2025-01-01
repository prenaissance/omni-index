import tls from "node:tls";
import fs from "fs/promises";
import { getPeerSse } from "./lib/get-peer-sse";

const fingerprint = await fs.readFile("certificate.sha256", "utf8");
const trustedFingerprints = new Map([["echo.websocket.org", fingerprint]]);

await getPeerSse("https://echo.websocket.org/.sse", (hostname, cert) => {
  const error = tls.checkServerIdentity(hostname, cert);
  if (error) {
    return error;
  }
  if (trustedFingerprints.get(hostname) !== cert.fingerprint256) {
    return new Error("Fingerprint mismatch");
  }
});
