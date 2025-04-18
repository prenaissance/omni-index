import { request } from "node:https";
import { PeerCertificate, TLSSocket } from "node:tls";

export const getCertificate = async (urlOrHostname: string) => {
  const url = urlOrHostname.startsWith("http")
    ? urlOrHostname
    : `https://${urlOrHostname}`;
  const response = request(url, {
    // consider using HEAD
    method: "HEAD",
    headers: {
      accept: "*/*",
    },
  });

  const peerCertificatePromise = new Promise<PeerCertificate>(
    (resolve, reject) => {
      response.once("socket", (socket: TLSSocket) => {
        socket.once("secureConnect", () => {
          resolve(socket.getPeerCertificate());
          response.destroy();
        });
      });

      response.once("error", reject);
    }
  );

  return await peerCertificatePromise;
};
