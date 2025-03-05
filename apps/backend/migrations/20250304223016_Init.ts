import { Db, WithId } from "mongodb";
import { MigrationInterface } from "mongo-migrate-ts";
import { NodeSavedSession, NodeSavedState } from "@atproto/oauth-client-node";
import { USERS_COLLECTION } from "~/common/auth/repositories/user-repository";
import { User } from "~/common/auth/entities/user";
import {
  OAUTH_SESSIONS_COLLECTION,
  OAUTH_STATES_COLLECTION,
} from "~/common/auth/storage";
import { ENTRY_COLLECTION } from "~/media/entities";
import {
  COMMENT_COLLECTION,
  COMMENT_LIKE_COLLECTION,
} from "~/media/comments/comment-repository";

export class Init20250304223016 implements MigrationInterface {
  public async up(db: Db): Promise<void | never> {
    const users = await db.createCollection<User>(USERS_COLLECTION);
    await users.createIndex({ did: 1 }, { unique: true });
    await users.createIndex({ handle: 1 }, { unique: true });
    await users.createIndex({ role: 1 });

    const oauthSessions = await db.createCollection<WithId<NodeSavedSession>>(
      OAUTH_SESSIONS_COLLECTION
    );
    await oauthSessions.createIndex({ "tokenSet.sub": 1 }, { unique: true });

    const oauthStates = await db.createCollection<WithId<NodeSavedState>>(
      OAUTH_STATES_COLLECTION
    );
    await oauthStates.createIndex({ key: 1 }, { unique: true });
    await oauthStates.createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 1800 }
    );

    const entries = await db.createCollection(ENTRY_COLLECTION);
    await entries.createIndex({ slug: 1 });
    await entries.createIndex({ "media._id": 1 });
    await entries.createIndex({ "media.mirrors._id": 1 });

    const comments = await db.createCollection(COMMENT_COLLECTION);
    await comments.createIndex({ entrySlug: 1 });
    await comments.createIndex({ tid: 1 });
    await comments.createIndex({ createdByDid: 1 });

    const commentLikes = await db.createCollection(COMMENT_LIKE_COLLECTION);
    await commentLikes.createIndex({ commentTid: 1 });
    await commentLikes.createIndex({ createdByDid: 1 });
  }

  public async down(db: Db): Promise<void | never> {
    await db.dropCollection(USERS_COLLECTION);
    await db.dropCollection(OAUTH_SESSIONS_COLLECTION);
    await db.dropCollection(OAUTH_STATES_COLLECTION);
    await db.dropCollection(ENTRY_COLLECTION);
    await db.dropCollection(COMMENT_COLLECTION);
    await db.dropCollection(COMMENT_LIKE_COLLECTION);
  }
}
