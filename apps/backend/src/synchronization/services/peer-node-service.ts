import { ObjectId } from "mongodb";
import { PeerNode, PeerNodeInit } from "../entities/peer-node";
import { PeerNodeRepository } from "../repositories/peer-node-repository";
import { getCertificate } from "../utilities";
import { PinnedCertificate } from "../entities/pinned-certificate";

export class PeerNodeService {
  private readonly hostnameSet = new Set<string>();
  private readonly fingerprintSet = new Set<string>();
  /** Cached hostnames available synchronously */
  get hostnames(): ReadonlySet<string> {
    return this.hostnameSet;
  }
  /** Cached fingerprints available synchronously */
  get fingerprints(): ReadonlySet<string> {
    return this.fingerprintSet;
  }
  constructor(private readonly peerNodeRepository: PeerNodeRepository) {}

  async init() {
    const peerNodes = await this.peerNodeRepository.getAll();
    peerNodes.forEach((node) => {
      this.hostnameSet.add(node.hostname);
      node.pinnedCertificates.forEach((certificate) => {
        this.fingerprintSet.add(certificate.sha256);
      });
    });
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
    peerNode.pinnedCertificates.forEach((certificate) => {
      this.fingerprintSet.add(certificate.sha256);
    });
  }

  /** Refreshes the pinned certificate for a peer node. Removes any older certificates. */
  async refresh(node: PeerNode) {
    const certificate = await getCertificate(node.hostname);
    const pinnedCertificates = node.pinnedCertificates;
    node.pinnedCertificates = [
      new PinnedCertificate({
        sha256: certificate.fingerprint256,
      }),
    ];
    await this.peerNodeRepository.save(node);

    pinnedCertificates.forEach((certificate) => {
      this.fingerprintSet.delete(certificate.sha256);
    });
    this.fingerprintSet.add(certificate.fingerprint256);
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
