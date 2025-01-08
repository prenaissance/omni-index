import {
  FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";
import { ExceptionSchema } from "~/common/payloads/exception-schema";
import { PeerNode } from "~/synchronization/entities/peer-node";
import { PinnedCertificate } from "~/synchronization/entities/pinned-certificate";
import { CreatePeerNodeRequest } from "~/synchronization/payloads/peer-node/create-peer-node-request";
import { PeerNodeResponse } from "~/synchronization/payloads/peer-node/peer-node-response";
import { getCertificate } from "~/synchronization/utilities";
import { isValidHostname } from "~/synchronization/validators";

const peerNodeRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.addSchema(CreatePeerNodeRequest);
  app.addSchema(PeerNodeResponse);

  app.post(
    "",
    {
      schema: {
        body: Type.Ref(CreatePeerNodeRequest),
        response: {
          201: Type.Ref(PeerNodeResponse),
          400: Type.Ref(ExceptionSchema),
          409: Type.Ref(ExceptionSchema),
        },
      },
    },
    async (request, reply) => {
      const { hostname, trustLevel } = request.body;

      const isValid = isValidHostname(hostname);
      if (!isValid) {
        reply.status(400);
        return {
          message: "Invalid hostname",
        };
      }

      const exists = await app.peerNodes.service.exists(hostname);
      if (exists) {
        reply.status(409);
        return {
          message: `Peer node with hostname "${hostname}" already exists`,
        };
      }

      const peerNode = new PeerNode({
        hostname,
        trustLevel,
      });

      const certificate = await getCertificate(hostname);
      peerNode.pinnedCertificates.push(
        new PinnedCertificate({
          sha256: certificate.fingerprint256,
        })
      );

      await app.peerNodes.service.add(peerNode);
      return peerNode;
    }
  );
};

export default peerNodeRoutes;
