import { Client } from "pg";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS "ai_resume_resumes" (
      "id" text PRIMARY KEY,
      "userId" text NOT NULL REFERENCES "ai_resume_user"("id"),
      "companyName" text,
      "jobTitle" text,
      "jobDescription" text,
      "resumeFileId" text NOT NULL,
      "imageFileId" text NOT NULL,
      "feedback" text,
      "createdAt" timestamp DEFAULT now(),
      "updatedAt" timestamp DEFAULT now()
    );
  `);

  console.log("Migration complete: ai_resume_resumes table created (if not exists).");
  await client.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
