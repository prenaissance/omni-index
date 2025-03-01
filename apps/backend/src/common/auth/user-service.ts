import { Agent } from "@atproto/api";
import { AtprotoDid } from "@atproto/oauth-client-node";
import { UserRepository } from "./repositories/user-repository";
import { User } from "./entities/user";
import { UserRole } from "./entities/enums/user-role";

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async importUser(atproto: Agent) {
    const did = atproto.assertDid as AtprotoDid;
    const { data } = await atproto.app.bsky.actor.getProfile({
      actor: did,
    });
    // TODO: give admin role based on env variable
    const user = new User({
      did,
      handle: data.handle,
      role: UserRole.User,
      displayName: data.displayName,
      description: data.description,
      avatarUrl: data.avatar,
    });
    await this.userRepository.save(user);
    return user;
  }
}
