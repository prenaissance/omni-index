import { Agent } from "@atproto/api";
import { AtprotoDid, NodeSavedSessionStore } from "@atproto/oauth-client-node";
import { filter, from, map, mergeMap, Observable } from "rxjs";
import { Event as AtprotoEvent } from "@atproto/sync";
import { FastifyBaseLogger } from "fastify";
import { IdResolver } from "@atproto/identity";
import { UserRepository } from "./repositories/user-repository";
import { User } from "./entities/user";
import { UserRole } from "./entities/enums/user-role";
import { Env } from "~/common/config/env";
import * as AppBskyActorProfile from "~/atproto/types/app/bsky/actor/profile";

type ProfileUpdatedEvent = AtprotoEvent & {
  event: "update";
  record: AppBskyActorProfile.Record;
};

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionStore: NodeSavedSessionStore,
    private readonly events$: Observable<AtprotoEvent>,
    private readonly env: Env,
    private readonly logger: FastifyBaseLogger
  ) {}

  async onInit() {
    await this.importAdminIfExists();
    this.events$
      .pipe(
        filter((event) => event.event === "update"),
        filter((event) => event.collection === "app.bsky.actor.profile"),
        filter((event) => AppBskyActorProfile.isRecord(event.record)),
        filter(
          (event) => AppBskyActorProfile.validateRecord(event.record).success
        ),
        mergeMap((event) => from(this.isUserInDb(event))),
        filter(({ isInDb }) => isInDb),
        map(({ event }) => event)
      )
      .subscribe((event) => this.handleProfileUpdate(event));
  }

  private async isUserInDb(event: ProfileUpdatedEvent) {
    return {
      event,
      isInDb: await this.userRepository.hasDid(event.did as AtprotoDid),
    };
  }

  private async handleProfileUpdate(event: ProfileUpdatedEvent) {
    const did = event.did as AtprotoDid;
    const user = await this.userRepository.getByDid(did);
    if (!user) {
      this.logger.error({
        msg: `Update profile event for user passed filter, but user not found in db`,
        did: event.did,
      });
      return;
    }

    user.displayName = event.record.displayName;
    user.description = event.record.description;
    const didDoc = await new IdResolver().did.resolve(did);
    const handle = didDoc?.alsoKnownAs?.[0]?.replace(/^at:\/\//, "");
    if (handle) {
      user.handle = handle;
    }

    if (event.record.avatar) {
      user.avatarUrl = `https://cdn.bsky.app/img/avatar/plain/${
        event.did
      }/${event.record.avatar.ref.toString()}@jpeg`;
    }
    await this.userRepository.save(user);
    this.logger.info({
      msg: "Updated user profile based on atproto event",
      did,
    });
  }

  /**
   * @returns the imported user, or null if the user was not imported
   */
  async importUser(did: AtprotoDid, atproto: Agent): Promise<User | null> {
    const {
      data: { value },
    } = await atproto.com.atproto.repo.getRecord({
      repo: did,
      collection: "app.bsky.actor.profile",
      rkey: "self",
    });
    const isProfileRecord = AppBskyActorProfile.isRecord(value);
    if (!isProfileRecord) {
      this.logger.error({
        msg: "Imported user does not have a profile record",
        did,
        value,
      });
      return null;
    }
    const validationResult = AppBskyActorProfile.validateRecord(value);
    if (!validationResult.success) {
      this.logger.error({
        msg: "Imported user profile is invalid",
        did,
        value,
      });
      return null;
    }
    const didDoc = await new IdResolver().did.resolve(did);
    const handle = didDoc?.alsoKnownAs?.[0]?.replace(/^at:\/\//, "");

    const isAdmin = [did, handle].includes(this.env.INIT_ADMIN_IDENTITY);
    const role = isAdmin ? UserRole.Owner : UserRole.User;
    const user = new User({
      did,
      handle,
      role,
      displayName: value.displayName,
      description: value.description,
      avatarUrl: value.avatar
        ? `https://cdn.bsky.app/img/avatar/plain/${did}/${value.avatar.ref.toString()}@jpeg`
        : undefined,
    });
    await this.userRepository.save(user);
    return user;
  }

  private async importAdminIfExists() {
    const user = await this.userRepository.findOne({
      role: UserRole.User,
      $or: [
        { did: this.env.INIT_ADMIN_IDENTITY as AtprotoDid },
        { handle: this.env.INIT_ADMIN_IDENTITY },
      ],
    });

    if (!user) {
      return;
    }

    user.role = UserRole.Admin;
    await this.userRepository.save(user);
    await this.sessionStore.del(user.did);
  }
}
