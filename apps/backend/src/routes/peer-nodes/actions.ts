import {
  FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";
import { ObjectId } from "mongodb";
import { ExceptionSchema } from "~/common/payloads/exception-schema";
import { ObjectIdSchema } from "~/common/payloads/object-id-schema";
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
        tags: ["Peer Nodes"],
        summary: "Creates a new peer node",
        description:
          "Creates a new peer node with the specified hostname and trust level",
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

  app.post(
    "/:id/refresh",
    {
      schema: {
        tags: ["Peer Nodes"],
        summary: "Refreshes the pinned certificate for a peer node",
        params: Type.Object({
          id: ObjectIdSchema({
            description: "ObjectId of the peer node",
          }),
        }),
        response: {
          200: Type.Ref(PeerNodeResponse),
          404: Type.Ref(ExceptionSchema),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const node = await app.peerNodes.repository.findOne({
        _id: new ObjectId(id),
      });
      if (!node) {
        reply.status(404);
        return {
          message: "Peer node not found",
        };
      }

      await app.peerNodes.service.refresh(node);
      return node;
    }
  );
};

export default peerNodeRoutes;
