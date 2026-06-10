import { Client } from "pg";
import fs from "fs";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  await client.connect();
  const sql = fs.readFileSync("drizzle/0000_init_auth_tables.sql", "utf8");
  await client.query(sql);
  console.log("Migration executed successfully");
  await client.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
