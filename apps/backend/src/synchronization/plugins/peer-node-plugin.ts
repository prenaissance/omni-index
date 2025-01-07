import { fastifyPlugin } from "fastify-plugin";
import { PeerNodeRepository } from "../repositories/peer-node-repository";
import { PeerNodeService } from "../services/peer-node-service";

declare module "fastify" {
  interface FastifyInstance {
    readonly peerNodes: {
      readonly repository: PeerNodeRepository;
      readonly service: PeerNodeService;
    };
  }
}

export const PEER_NODE_PLUGIN = "peer-node";

export const peerNodePlugin = fastifyPlugin(
  async (app) => {
    const repository = new PeerNodeRepository(app.db);
    const service = new PeerNodeService(repository);
    await service.init();

    app.decorate("peerNodes", {
      repository,
      service,
    });
  },
  {
    name: PEER_NODE_PLUGIN,
  }
);
