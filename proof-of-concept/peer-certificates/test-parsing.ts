import { X509Certificate } from "node:crypto";
import fs from "node:fs/promises";

const derData = await fs.readFile("certificate.der");
const certificate = new X509Certificate(derData);
console.log(certificate.issuer);
