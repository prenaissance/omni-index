import { fastifyPlugin } from "fastify-plugin";
import { PeerNodeRepository } from "../repositories/peer-node-repository";
import { PeerNodeService } from "../services/peer-node-service";
import { STORED_EVENT_PLUGIN } from "~/stored-events/stored-event-plugin";
import { MEDIA_PLUGIN } from "~/media/media-entry-plugin";

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
    const service = new PeerNodeService(
      repository,
      app.storedEvents.repository,
      app.mediaEntry.service,
      app.env,
      app.log
    );

    app.decorate("peerNodes", {
      repository,
      service,
    });

    app.addHook("onReady", async () => {
      await service.init();
    });
  },
  {
    name: PEER_NODE_PLUGIN,
    dependencies: [STORED_EVENT_PLUGIN, MEDIA_PLUGIN],
  }
);
