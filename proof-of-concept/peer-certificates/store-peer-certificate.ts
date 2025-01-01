import { writeFile } from "fs/promises";
import { getPeerSse } from "./lib/get-peer-sse";

const URL = "https://echo.websocket.org/.sse";
const { peerCertificate } = await getPeerSse(URL);

await writeFile("certificate.sha256", peerCertificate.fingerprint256);
