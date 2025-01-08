import { ObjectId } from "mongodb";
import { PeerNode, PeerNodeInit } from "../entities/peer-node";
import { PeerNodeRepository } from "../repositories/peer-node-repository";

export class PeerNodeService {
  private readonly hostnameSet = new Set<string>();
  /** Cached hostnames available synchronously */
  get hostnames(): ReadonlySet<string> {
    return this.hostnameSet;
  }
  constructor(private readonly peerNodeRepository: PeerNodeRepository) {}

  async init() {
    const peerNodes = await this.peerNodeRepository.getAll();
    peerNodes.forEach((node) => this.hostnameSet.add(node.hostname));
  }

  async exists(hostname: string) {
    return this.hostnameSet.has(hostname);
  }

  async add(node: PeerNodeInit) {
    const existingNode = await this.peerNodeRepository.findOne({
      hostname: node.hostname,
    });

    if (existingNode) {
      return;
    }

    const peerNode = new PeerNode(node);
    await this.peerNodeRepository.save(peerNode);
    this.hostnameSet.add(peerNode.hostname);
  }

  async deleteById(id: ObjectId) {
    const node = await this.peerNodeRepository.findOne({ _id: id });

    if (!node) {
      return false;
    }

    const deleted = await this.peerNodeRepository.deleteOne({ _id: id });

    if (deleted) {
      this.hostnameSet.delete(node.hostname);
    }

    return deleted;
  }
}
