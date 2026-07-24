import { MongoClient, Db, MongoClientOptions } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Missing MONGODB_URI in .env.local');
}

const uri: string = process.env.MONGODB_URI;
const dbName: string = process.env.MONGODB_DB || 'gars_db';

const options: MongoClientOptions = {
  tls: true,
  tlsAllowInvalidCertificates: true,
  serverSelectionTimeoutMS: 10000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// In dev, Next.js hot-reloads modules, which would otherwise open a new
// MongoClient (and a new connection pool) on every file save. Caching the
// promise on the global object survives those reloads. In production there
// is no hot-reload, so a plain module-scoped client is fine.
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

/** Raw MongoClient promise — use when you need something client-level (transactions, sessions). */
export default clientPromise;

/** Convenience helper: returns the connected Db instance for GARS. */
export async function getDb(): Promise<Db> {
  const connectedClient = await clientPromise;
  return connectedClient.db(dbName);
}
