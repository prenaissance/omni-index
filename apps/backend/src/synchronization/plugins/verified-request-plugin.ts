import { request } from "node:https";
import tls, { type PeerCertificate } from "node:tls";
import { fastifyPlugin } from "fastify-plugin";
import { Observable } from "rxjs";
import { createParser } from "eventsource-parser";
import { FingerprintMismatchError } from "../errors/fingerprint-mismatch-error";
import { PEER_NODE_PLUGIN } from "./peer-node-plugin";
import { ENV_PLUGIN } from "~/common/config/env-plugin";

declare module "fastify" {
  interface FastifyInstance {
    readonly verifiedRequest: {
      sse<TEvent>(url: URL | string): Observable<TEvent>;
    };
  }
}

export const VERIFIED_REQUEST_PLUGIN = "verified-request-plugin";

export const verifiedRequestPlugin = fastifyPlugin(
  async (app) => {
    const checkServerIdentity = (hostname: string, cert: PeerCertificate) => {
      const error = tls.checkServerIdentity(hostname, cert);
      if (error) {
        return error;
      }
      if (app.peerNodes.service.fingerprints.has(cert.fingerprint256)) {
        return new FingerprintMismatchError();
      }
    };

    app.decorate("verifiedRequest", {
      sse<TEvent>(url: URL | string) {
        const response = request(url, {
          method: "GET",
          headers: {
            Accept: "text/event-stream",
          },
          ...(!app.env.DANGEROUS_SKIP_IDENTITY_VERIFICATION && {
            checkServerIdentity,
          }),
        });

        return new Observable<TEvent>((subscriber) => {
          const parser = createParser({
            onEvent(event) {
              subscriber.next(event as TEvent);
            },
            onError(error) {
              subscriber.error(error);
            },
          });

          response.on("error", (error) => {
            subscriber.error(error);
          });

          response.on("data", (chunk) => {
            parser.feed(chunk);
          });

          response.on("end", () => {
            subscriber.complete();
          });
        });
      },
    });
  },
  {
    name: VERIFIED_REQUEST_PLUGIN,
    dependencies: [PEER_NODE_PLUGIN, ENV_PLUGIN],
  }
);
