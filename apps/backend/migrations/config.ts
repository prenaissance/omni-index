import { mongoMigrateCli } from "mongo-migrate-ts";

mongoMigrateCli({
  useEnv: true,
  environment: {
    uriVar: "MONGODB_URL",
    databaseVar: "MONGODB_DB",
  },
  options: {},
  migrationsDir: "migrations",
  migrationsCollection: "__migrations",
  globPattern: "**/*.[jt]s",
  migrationNameTimestampFormat: "yyyyMMddHHmmss",
});
