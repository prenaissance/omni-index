import { Collection, Db, Filter } from "mongodb";
import { PeerNode } from "../entities/peer-node";

export const PEER_NODE_COLLECTION = "peer-nodes";

export class PeerNodeRepository {
  private readonly collection: Collection<PeerNode>;
  constructor(private readonly db: Db) {
    this.collection = db.collection<PeerNode>(PEER_NODE_COLLECTION);
  }

  async save(peerNode: PeerNode) {
    await this.collection.updateOne(
      { _id: peerNode._id },
      { $set: peerNode },
      { upsert: true }
    );
  }

  async getAll() {
    const documents = await this.collection.find().toArray();
    return documents.map(PeerNode.fromDocument);
  }

  async findOne(filter: Filter<PeerNode>) {
    const document = await this.collection.findOne(filter);
    if (!document) {
      return null;
    }
    return PeerNode.fromDocument(document);
  }

  async deleteOne(filter: Filter<PeerNode>) {
    const result = await this.collection.deleteOne(filter);
    return !!result.deletedCount;
  }
}
