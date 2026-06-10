import { Client } from "pg";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  await client.connect();

  // Drop old tables
  await client.query(`
    DROP TABLE IF EXISTS auth_account CASCADE;
    DROP TABLE IF EXISTS auth_session CASCADE;
    DROP TABLE IF EXISTS auth_verification CASCADE;
    DROP TABLE IF EXISTS auth_user CASCADE;
  `);
  console.log("Old auth tables dropped");

  // Create new tables with ai_resume_ prefix
  await client.query(`
    CREATE TABLE IF NOT EXISTS "ai_resume_user" (
      "id" text PRIMARY KEY,
      "name" text,
      "email" text NOT NULL UNIQUE,
      "emailVerified" boolean NOT NULL DEFAULT false,
      "image" text,
      "createdAt" timestamp DEFAULT now(),
      "updatedAt" timestamp DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS "ai_resume_session" (
      "id" text PRIMARY KEY,
      "userId" text NOT NULL REFERENCES "ai_resume_user"("id"),
      "expiresAt" timestamp NOT NULL,
      "token" text NOT NULL UNIQUE,
      "createdAt" timestamp DEFAULT now(),
      "updatedAt" timestamp DEFAULT now(),
      "ipAddress" text,
      "userAgent" text
    );

    CREATE TABLE IF NOT EXISTS "ai_resume_account" (
      "id" text PRIMARY KEY,
      "userId" text NOT NULL REFERENCES "ai_resume_user"("id"),
      "accountId" text NOT NULL,
      "providerId" text NOT NULL,
      "accessToken" text,
      "refreshToken" text,
      "idToken" text,
      "accessTokenExpiresAt" timestamp,
      "refreshTokenExpiresAt" timestamp,
      "scope" text,
      "password" text,
      "createdAt" timestamp DEFAULT now(),
      "updatedAt" timestamp DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS "ai_resume_verification" (
      "id" text PRIMARY KEY,
      "identifier" text NOT NULL,
      "value" text NOT NULL,
      "expiresAt" timestamp NOT NULL,
      "createdAt" timestamp DEFAULT now(),
      "updatedAt" timestamp DEFAULT now()
    );
  `);
  console.log("New ai_resume tables created successfully");

  await client.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
