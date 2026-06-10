import { Client } from "pg";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS "ai_resume_files" (
      "id" text PRIMARY KEY,
      "userId" text REFERENCES "ai_resume_user"("id"),
      "name" text NOT NULL,
      "path" text NOT NULL UNIQUE,
      "mimeType" text,
      "data" bytea NOT NULL,
      "createdAt" timestamp DEFAULT now()
    );
  `);
  console.log("ai_resume_files table created successfully");

  await client.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
