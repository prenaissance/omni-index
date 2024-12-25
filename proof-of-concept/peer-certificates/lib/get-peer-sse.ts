import { request } from "node:https";
import type { PeerCertificate, TLSSocket } from "node:tls";
import { Observable } from "rxjs";

export const getPeerSse = async (
  url: string | URL,
  checkServerIdentity?: (
    hostname: string,
    cert: PeerCertificate,
  ) => Error | undefined,
) => {
  const response = request(url, {
    method: "GET",
    headers: {
      Accept: "text/event-stream",
    },
    ...(checkServerIdentity && {
      checkServerIdentity,
    }),
  });

  const peerCertificatePromise = new Promise<PeerCertificate>(
    (resolve, reject) => {
      response.once("socket", (socket: TLSSocket) => {
        socket.once("secureConnect", () => {
          resolve(socket.getPeerCertificate());
        });
      });

      response.once("error", reject);
    },
  );

  return {
    data$: new Observable((subscriber) => {
      response.on("data", subscriber.next.bind(subscriber));
      response.on("end", subscriber.complete.bind(subscriber));
      response.on("error", subscriber.error.bind(subscriber));
    }),
    peerCertificate: await peerCertificatePromise,
  };
};
