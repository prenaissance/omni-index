import { Agent } from "@atproto/api";
import { AtprotoDid, NodeSavedSessionStore } from "@atproto/oauth-client-node";
import { UserRepository } from "./repositories/user-repository";
import { User } from "./entities/user";
import { UserRole } from "./entities/enums/user-role";
import { Env } from "~/common/config/env";

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionStore: NodeSavedSessionStore,
    private readonly env: Env
  ) {}

  async onInit() {
    await this.importAdminIfExists();
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
      $or: [
        { did: this.env.INIT_ADMIN_IDENTITY as AtprotoDid },
        { handle: this.env.INIT_ADMIN_IDENTITY },
      ],
    });
    console.log({ user, adminIdentity: this.env.INIT_ADMIN_IDENTITY });

    if (!user) {
      return;
    }

    user.role = UserRole.Admin;
    await this.userRepository.save(user);
    await this.sessionStore.del(user.did);
  }
}
