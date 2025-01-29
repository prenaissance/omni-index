import { MongoClient } from "mongodb";
import { z } from "zod";
import { seedEntries } from "./data/seed-entries";
import { Entry, ENTRY_COLLECTION } from "~/media/entities";

const credentials = z
  .object({
    MONGODB_URL: z.string().min(1),
    MONGODB_DB: z.string().min(1),
  })
  .parse(process.env);

const mongoClient = new MongoClient(credentials.MONGODB_URL);

const main = async () => {
  await mongoClient.connect();
  const db = mongoClient.db(credentials.MONGODB_DB);

  const entriesCollection = db.collection<Entry>(ENTRY_COLLECTION);
  let insertedEntries = 0;

  for (const entry of seedEntries) {
    const exists = await entriesCollection.findOne({ title: entry.title });
    if (exists) continue;

    await entriesCollection.insertOne(Entry.fromDocument(entry));
    insertedEntries++;
  }
  console.log(`Inserted ${insertedEntries} seed entries`);
};

main()
  .catch(console.error)
  .finally(() => mongoClient.close())
  .then(() => process.exit(0));
