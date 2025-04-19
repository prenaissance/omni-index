import {
  FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";
import { ObjectId } from "mongodb";
import { UserRole } from "~/common/auth/entities/enums/user-role";
import { ExceptionSchema, ObjectIdSchema } from "~/common/payloads";
import { PeerNode } from "~/synchronization/entities/peer-node";
import { PinnedCertificate } from "~/synchronization/entities/pinned-certificate";
import {
  CreatePeerNodeRequest,
  PeerNodeListResponse,
  PeerNodeResponse,
} from "~/synchronization/payloads/peer-node";
import { UpdatePeerNodeRequest } from "~/synchronization/payloads/peer-node/update-peer-node-request";
import { getCertificate } from "~/synchronization/utilities";

const peerNodeRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.addSchema(CreatePeerNodeRequest);
  app.addSchema(UpdatePeerNodeRequest);
  app.addSchema(PeerNodeResponse);
  app.addSchema(PeerNodeListResponse);

  app.get(
    "",
    {
      onRequest: [app.verifyRoles([UserRole.Owner, UserRole.Admin])],
      schema: {
        tags: ["Peer Nodes"],
        summary: "Retrieves all peer nodes",
        response: {
          200: Type.Ref(PeerNodeListResponse),
        },
      },
    },
    async () => {
      return await app.peerNodes.repository.getAll();
    }
  );

  app.post(
    "",
    {
      onRequest: [app.verifyRoles([UserRole.Owner, UserRole.Admin])],
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
      const { url, trustLevel } = request.body;

      const isValid = URL.canParse(url);
      if (!isValid) {
        reply.status(400);
        return {
          message: "Invalid url",
        };
      }

      const urlObj = new URL(url);
      const isValidProtocol = ["http:", "https:"].includes(urlObj.protocol);
      if (!isValidProtocol) {
        reply.status(400);
        return {
          message: "Invalid url protocol",
        };
      }

      if (
        !app.env.DANGEROUS_SKIP_IDENTITY_VERIFICATION &&
        urlObj.protocol !== "https:"
      ) {
        reply.status(400);
        return {
          message:
            "Only https urls are allowed. Set the environment variable DANGEROUS_SKIP_IDENTITY_VERIFICATION=true to allow http urls.",
        };
      }

      const exists = await app.peerNodes.service.exists(url);
      if (exists) {
        reply.status(409);
        return {
          message: `Peer node with url "${url}" already exists`,
        };
      }

      const peerNode = new PeerNode({
        url,
        trustLevel,
      });

      const certificate = await getCertificate(url).catch((error) =>
        app.env.DANGEROUS_SKIP_IDENTITY_VERIFICATION
          ? null
          : Promise.reject(error)
      );
      if (certificate) {
        peerNode.pinnedCertificates.push(
          new PinnedCertificate({
            sha256: certificate.fingerprint256,
          })
        );
      }

      await app.peerNodes.service.add(peerNode);
      reply.status(201);
      return peerNode;
    }
  );

  app.patch(
    "/:id",
    {
      onRequest: [app.verifyRoles([UserRole.Owner, UserRole.Admin])],
      schema: {
        tags: ["Peer Nodes"],
        summary: "Updates a peer node",
        body: Type.Ref(UpdatePeerNodeRequest),
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
      const peerNode = await app.peerNodes.repository.findOne({
        _id: new ObjectId(id),
      });
      if (!peerNode) {
        reply.status(404);
        return {
          message: "Peer node not found",
        };
      }
      Object.assign(peerNode, request.body);
      await app.peerNodes.repository.save(peerNode);
      return peerNode;
    }
  );

  app.post(
    "/:id/refresh",
    {
      onRequest: [app.verifyRoles([UserRole.Owner, UserRole.Admin])],
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

  app.delete(
    "/:id",
    {
      onRequest: [app.verifyRoles([UserRole.Owner, UserRole.Admin])],
      schema: {
        tags: ["Peer Nodes"],
        summary: "Deletes a peer node",
        params: Type.Object({
          id: ObjectIdSchema({
            description: "ObjectId of the peer node",
          }),
        }),
        response: {
          204: Type.Null(),
          404: Type.Ref(ExceptionSchema),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const deleted = await app.peerNodes.service.deleteById(new ObjectId(id));
      if (!deleted) {
        reply.status(404);
        return {
          message: "Peer node not found",
        };
      }
      reply.status(204);
    }
  );
};

export default peerNodeRoutes;
