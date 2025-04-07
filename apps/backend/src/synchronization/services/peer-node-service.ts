import * as https from "node:https";
import * as http from "node:http";
import * as tls from "node:tls";
import { ObjectId } from "mongodb";
import { defer, Observable, repeat, Subscription, tap } from "rxjs";
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

    // should use https only, allowing http for dev testing purposes
    const request =
      this.env.DANGEROUS_SKIP_IDENTITY_VERIFICATION &&
      new URL(url).protocol === "http:"
        ? http.request
        : https.request;

    return defer(() => {
      const response = request(url, {
        method: "GET",
        headers: {
          accept: "text/event-stream",
          connection: "keep-alive",
          "cache-control": "no-cache",
        },
        ...(!this.env.DANGEROUS_SKIP_IDENTITY_VERIFICATION && {
          checkServerIdentity,
        }),
      });

      return new Observable<TEvent>((subscriber) => {
        const parser = createParser({
          onEvent(event) {
            subscriber.next(event as TEvent);
            console.log({ event });
          },
          onError(error) {
            subscriber.error(error);
          },
        });

        response.on("response", (info) => {
          if (info.statusCode === 200) {
            this.logger.debug({
              msg: "Peer node connection established",
              url,
              statusCode: info.statusCode,
              statusMessage: info.statusMessage,
            });
          } else {
            subscriber.error(new Error("Non-200 status code (response event)"));
          }
        });

        response.on("error", (error) => {
          subscriber.error(error);
        });

        response.on("data", (chunk) => {
          parser.feed(chunk);
          console.log({ chunk });
        });

        response.on("end", () => {
          subscriber.complete();
        });

        response.end();
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
      .pipe(
        tap({
          error: (error) => {
            this.logger.debug({
              msg: "Error during listening to SSE stream",
              url: url.toString(),
              error: "message" in error ? error.message : error,
            });
          },
        }),
        // repeat({ delay: 1000 }),
        retryWithBackoff()
      )
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
