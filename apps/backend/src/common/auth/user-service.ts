import { Agent } from "@atproto/api";
import { AtprotoDid, NodeSavedSessionStore } from "@atproto/oauth-client-node";
import { filter, from, map, mergeMap, Observable } from "rxjs";
import { Event as AtprotoEvent } from "@atproto/sync";
import { FastifyBaseLogger } from "fastify";
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
    const user = await this.userRepository.getByDid(event.did as AtprotoDid);
    if (!user) {
      this.logger.error({
        msg: `Update profile event for user passed filter, but user not found in db`,
        did: event.did,
      });
      return;
    }

    user.displayName = event.record.displayName;
    user.description = event.record.description;

    if (event.record.avatar) {
      user.avatarUrl = `https://cdn.bsky.app/img/avatar/plain/${
        event.did
      }/${event.record.avatar.ref.toString()}@jpeg`;
    }
    await this.userRepository.save(user);
    this.logger.info({
      msg: "Updated user profile based on atproto event",
      did: user.did,
    });
  }

  async importUser(atproto: Agent) {
    const did = atproto.assertDid as AtprotoDid;
    const { data } = await atproto.app.bsky.actor.getProfile({
      actor: did,
    });
    const isAdmin = [data.did, data.handle].includes(
      this.env.INIT_ADMIN_IDENTITY
    );
    const role = isAdmin ? UserRole.Admin : UserRole.User;
    const user = new User({
      did,
      handle: data.handle,
      role,
      displayName: data.displayName,
      description: data.description,
      avatarUrl: data.avatar,
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
