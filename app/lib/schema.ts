import { pgTable, text, integer, timestamp, boolean, customType } from "drizzle-orm/pg-core";

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
});

export const user = pgTable("ai_resume_user", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const session = pgTable("ai_resume_session", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
});

export const account = pgTable("ai_resume_account", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const verification = pgTable("ai_resume_verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const files = pgTable("ai_resume_files", {
  id: text("id").primaryKey(),
  userId: text("userId").references(() => user.id),
  name: text("name").notNull(),
  path: text("path").notNull().unique(),
  mimeType: text("mimeType"),
  data: bytea("data").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const resumes = pgTable("ai_resume_resumes", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  companyName: text("companyName"),
  jobTitle: text("jobTitle"),
  jobDescription: text("jobDescription"),
  resumeFileId: text("resumeFileId").notNull(),
  imageFileId: text("imageFileId").notNull(),
  feedback: text("feedback"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});
