import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function check() {
  const result = await client.execute("PRAGMA table_info(wallet_scans)");
  console.log('wallet_scans columns:', result.rows.map(r => ({ name: r.name, type: r.type })));
}
check();
