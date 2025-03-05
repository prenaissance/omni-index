import { Db } from "mongodb";
import { MigrationInterface } from "mongo-migrate-ts";
import { CONFIG_COLLECTION } from "~/common/config/config-storage";

export class Config20250305212053 implements MigrationInterface {
  public async up(db: Db): Promise<void | never> {
    const _configs = await db.createCollection(CONFIG_COLLECTION);
  }

  public async down(db: Db): Promise<void | never> {
    await db.dropCollection(CONFIG_COLLECTION);
  }
}
