import { request } from "node:https";
import tls, { type PeerCertificate } from "node:tls";
import { fastifyPlugin } from "fastify-plugin";
import { Observable } from "rxjs";
import { PEER_NODE_PLUGIN } from "./peer-node-plugin";
import { env } from "~/common/config/env";

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
        return new Error("Fingerprint mismatch");
      }
    };

    app.decorate("verifiedRequest", {
      sse<TEvent>(url: URL | string) {
        const response = request(url, {
          method: "GET",
          headers: {
            Accept: "text/event-stream",
          },
          ...(!env.DANGEROUS_SKIP_IDENTITY_VERIFICATION && {
            checkServerIdentity,
          }),
        });

        return new Observable<TEvent>((subscriber) => {
          response.on("data", subscriber.next.bind(subscriber));
          response.on("end", subscriber.complete.bind(subscriber));
          response.on("error", subscriber.error.bind(subscriber));
        });
      },
    });
  },
  {
    name: VERIFIED_REQUEST_PLUGIN,
    dependencies: [PEER_NODE_PLUGIN],
  }
);
