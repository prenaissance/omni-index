import * as tls from "node:tls";
import { Readable } from "node:stream";
import { ObjectId } from "mongodb";
import { defer, Observable, repeat, Subscription } from "rxjs";
import { FastifyBaseLogger } from "fastify";
import { createParser } from "eventsource-parser";
import { PeerNode, PeerNodeInit } from "../entities/peer-node";
import { PeerNodeRepository } from "../repositories/peer-node-repository";
import { getCertificate } from "../utilities";
import { PinnedCertificate } from "../entities/pinned-certificate";
import { FingerprintMismatchError } from "../errors/fingerprint-mismatch-error";
import { retryWithBackoff } from "~/common/utilities/rxjs";
import { EventMap, EventType } from "~/common/events/event-map";
import { MatchesPattern } from "~/common/types/strings";
import { Env } from "~/common/config/env";

type EntryEvent = EventMap[MatchesPattern<"entry.*", EventType>];

export class PeerNodeService {
  private readonly subscriptionMap = new Map<string, Subscription>();
  private readonly urlSet = new Set<string>();
  private readonly fingerprintSet = new Set<string>();
  /** Cached urls available synchronously */
  get hostnames(): ReadonlySet<string> {
    return this.urlSet;
  }
  /** Cached fingerprints available synchronously */
  get fingerprints(): ReadonlySet<string> {
    return this.fingerprintSet;
  }
  constructor(
    private readonly peerNodeRepository: PeerNodeRepository,
    private readonly env: Env,
    private readonly logger: FastifyBaseLogger
  ) {}

  private sse<TEvent>(url: URL | string) {
    const checkServerIdentity = (
      hostname: string,
      cert: tls.PeerCertificate
    ) => {
      const error = tls.checkServerIdentity(hostname, cert);
      if (error) {
        return error;
      }
      if (this.fingerprints.has(cert.fingerprint256)) {
        return new FingerprintMismatchError();
      }
    };

    return defer(() => {
      return new Observable<TEvent>((subscriber) => {
        const parser = createParser({
          onEvent: (event) => {
            try {
              subscriber.next(JSON.parse(event.data) as TEvent);
              console.log(JSON.parse(event.data));
            } catch {
              this.logger.debug({
                msg: "Failed to deserialize SSE event",
                url,
                event: event.data,
              });
            }
          },
          onError: (error) => {
            subscriber.error(error);
          },
        });

        fetch(url, {
          method: "GET",
          headers: {
            accept: "text/event-stream",
            connection: "keep-alive",
            "cache-control": "no-cache",
          },
          ...(!this.env.DANGEROUS_SKIP_IDENTITY_VERIFICATION && {
            checkServerIdentity,
          }),
        })
          .then((response) => {
            if (!response.ok) {
              return Promise.reject(new Error("Non-200 status code"));
            } else {
              this.logger.debug({
                msg: "Peer node connection established",
                url,
                status: response.status,
                statusMessage: response.statusText,
              });
            }
            return response.body;
          })
          .then(async (body) => {
            if (!body) {
              return Promise.reject(new Error("No response body object"));
            }

            const stream = Readable.fromWeb(body as never, {
              encoding: "utf-8",
            });
            for await (const chunk of stream) {
              parser.feed(chunk);
            }
            subscriber.complete();
            this.logger.debug({
              msg: "Peer node connection closed",
              url,
            });
          })
          .catch((error) => {
            this.logger.debug({
              msg: "Peer node connection error",
              url,
              error: "message" in error ? error.message : error,
            });
            subscriber.error(error);
          });
      });
    });
  }

  private async loadPinnedCertificates() {
    const peerNodes = await this.peerNodeRepository.getAll();
    for (const node of peerNodes) {
      this.urlSet.add(node.url);
      for (const certificate of node.pinnedCertificates) {
        this.fingerprintSet.add(certificate.sha256);
      }
    }
  }

  private subscribeToNodeChanges(nodeUrl: string) {
    const url = new URL(nodeUrl);
    url.pathname = "/api/entries/sse";
    const subscription = this.sse<EntryEvent>(url.toString())
      .pipe(retryWithBackoff(), repeat({ delay: 1000 }))
      .subscribe((event) => {
        console.log("TODO");

        switch (event.type) {
          case "entry.created":
          case "entry.updated":
          case "entry.deleted":
        }
      });
    this.subscriptionMap.set(nodeUrl, subscription);
  }

  private async subscribeToPeerNodesChanges() {
    const peerNodes = await this.peerNodeRepository.getAll();
    for (const node of peerNodes) {
      this.subscribeToNodeChanges(node.url);
    }
  }

  async init() {
    await this.loadPinnedCertificates();
    await this.subscribeToPeerNodesChanges();
  }

  async exists(hostname: string) {
    return this.urlSet.has(hostname);
  }

  async add(node: PeerNodeInit) {
    const existingNode = await this.peerNodeRepository.findOne({
      url: node.url,
    });

    if (existingNode) {
      return;
    }

    const peerNode = new PeerNode(node);
    await this.peerNodeRepository.save(peerNode);
    this.urlSet.add(peerNode.url);
    peerNode.pinnedCertificates.forEach((certificate) => {
      this.fingerprintSet.add(certificate.sha256);
    });
    this.subscribeToNodeChanges(peerNode.url);
  }

  /** Refreshes the pinned certificate for a peer node. Removes any older certificates. */
  async refresh(node: PeerNode) {
    const certificate = await getCertificate(node.url);
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
      this.subscriptionMap.get(node.url)?.unsubscribe();
      this.urlSet.delete(node.url);
    }

    return deleted;
  }
}
