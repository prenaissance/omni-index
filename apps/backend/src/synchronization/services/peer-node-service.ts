import * as tls from "node:tls";
import { ObjectId } from "mongodb";
import { defer, filter, Observable, repeat, Subscription } from "rxjs";
import { FastifyBaseLogger } from "fastify";
import { createParser } from "eventsource-parser";
import { Agent, Dispatcher } from "undici";
import BodyReadable from "undici/types/readable";
import { NodeTrustLevel, PeerNode, PeerNodeInit } from "../entities/peer-node";
import { PeerNodeRepository } from "../repositories/peer-node-repository";
import { getCertificate } from "../utilities";
import { PinnedCertificate } from "../entities/pinned-certificate";
import { FingerprintMismatchError } from "../errors/fingerprint-mismatch-error";
import { retryWithBackoff } from "~/common/utilities/rxjs";
import { EventMap, EventType } from "~/common/events/event-map";
import { MatchesPattern } from "~/common/types/strings";
import { Env } from "~/common/config/env";
import { StoredEventRepository } from "~/stored-events/stored-event-repository";
import {
  StoredEvent,
  StoredEventStatus,
} from "~/stored-events/entities/stored-event";
import { EntryService } from "~/media/entry-service";
import { HeartbeatEvent } from "~/common/events/heartbeat-event";

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
  private readonly agent: Agent;
  constructor(
    private readonly peerNodeRepository: PeerNodeRepository,
    private readonly storedEventRepository: StoredEventRepository,
    private readonly entryService: EntryService,
    private readonly env: Env,
    private readonly logger: FastifyBaseLogger
  ) {
    this.agent = new Agent({
      connect: {
        checkServerIdentity: this.env.DANGEROUS_SKIP_IDENTITY_VERIFICATION
          ? undefined
          : (hostname, cert) => {
              const error = tls.checkServerIdentity(hostname, cert);
              if (error) {
                return error;
              }
              if (!this.fingerprintSet.has(cert.fingerprint256)) {
                return new FingerprintMismatchError();
              }
            },
      },
    });
  }

  private sse<TEvent>(urlOrString: URL | string) {
    return defer(() => {
      return new Observable<TEvent>((subscriber) => {
        const controller = new AbortController();
        let body: (BodyReadable & Dispatcher.BodyMixin) | null = null;
        const parser = createParser({
          onEvent: (event) => {
            try {
              subscriber.next(JSON.parse(event.data) as TEvent);
            } catch {
              this.logger.debug({
                msg: "Failed to deserialize SSE event",
                url: urlOrString,
                event: event.data,
              });
            }
          },
          onError: (error) => {
            subscriber.error(error);
          },
        });

        const url = new URL(urlOrString);
        this.agent
          .request({
            origin: url.origin,
            path: url.pathname,
            method: "GET",
            headers: {
              accept: "text/event-stream",
              connection: "keep-alive",
              "cache-control": "no-cache",
            },
            signal: controller.signal,
          })
          .then((response) => {
            if (response.statusCode >= 400) {
              return Promise.reject(new Error("Non-200 status code"));
            } else {
              this.logger.debug({
                msg: "Peer node connection established",
                url: urlOrString,
                status: response.statusCode,
              });
            }
            return response.body;
          })
          .then(async (_body) => {
            body = _body;
            if (!body) {
              return Promise.reject(new Error("No response body object"));
            }

            for await (const chunk of body) {
              parser.feed(Buffer.from(chunk).toString("utf8"));
            }

            subscriber.complete();
            this.logger.debug({
              msg: "Peer node connection closed",
              url: urlOrString,
            });
          })
          .catch((error) => {
            if (error.name === "AbortError") {
              subscriber.complete();
              return;
            }
            this.logger.debug({
              msg: "Peer node connection error",
              url: urlOrString,
              error: "message" in error ? error.message : error,
            });
            subscriber.error(error);
          });

        return () => {
          controller.abort();
          body?.dump();
        };
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

  async applyEventChange(event: EntryEvent, nodeUrl: string) {
    switch (event.type) {
      case "entry.created":
        await this.entryService.synchronizeCreation(event, nodeUrl);
        break;
      case "entry.updated":
        await this.entryService.synchronizeUpdate(event, nodeUrl);
        break;
      case "entry.deleted":
        await this.entryService.synchronizeDeletion(event, nodeUrl);
        break;
    }
  }

  private subscribeToNodeChanges(nodeUrl: string, trustLevel: NodeTrustLevel) {
    const url = new URL(nodeUrl);
    url.pathname = "/api/entries/sse";
    const subscription = this.sse<EntryEvent | HeartbeatEvent>(url.toString())
      .pipe(
        filter((event) => event.type !== "heartbeat"),
        retryWithBackoff(),
        repeat({ delay: 1000 })
      )
      .subscribe(async (event) => {
        const eventProcessed = await this.storedEventRepository.existsId(
          new ObjectId(event.id)
        );
        if (eventProcessed) {
          this.logger.debug({
            msg: "Received event echo. Skipping propagation.",
            eventId: event.id,
            eventType: event.type,
            nodeUrl,
          });
          return;
        }
        const status =
          trustLevel === NodeTrustLevel.Trusted
            ? StoredEventStatus.Accepted
            : StoredEventStatus.Pending;
        const storedEvent = new StoredEvent({
          _id: new ObjectId(event.id),
          type: event.type,
          payload: event.payload,
          nodeUrl,
          status,
        });

        await this.storedEventRepository.save(storedEvent);
        if (status === StoredEventStatus.Accepted) {
          await this.applyEventChange(event, nodeUrl);
        }
      });
    this.subscriptionMap.set(nodeUrl, subscription);
  }

  private async subscribeToPeerNodesChanges() {
    const peerNodes = await this.peerNodeRepository.getAll();
    for (const node of peerNodes) {
      this.subscribeToNodeChanges(node.url, node.trustLevel);
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
    this.subscribeToNodeChanges(peerNode.url, node.trustLevel);
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
