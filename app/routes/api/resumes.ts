import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { db } from "~/lib/db";
import { resumes } from "~/lib/schema";
import { auth } from "~/lib/auth";
import { eq, sql, desc } from "drizzle-orm";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const userResumes = await db
    .select()
    .from(resumes)
    .where(eq(resumes.userId, session.user.id))
    .orderBy(desc(resumes.createdAt));

  return userResumes;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  if (request.method === "DELETE") {
    await db.delete(resumes).where(eq(resumes.userId, session.user.id));
    return { success: true };
  }

  if (request.method === "POST") {
    const existingCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(resumes)
      .where(eq(resumes.userId, session.user.id));
    
    if (existingCount[0].count >= 3) {
      return new Response("Maximum 3 reviews per user reached", { status: 403 });
    }

    const body = await request.json();
    const {
      id,
      companyName,
      jobTitle,
      jobDescription,
      resumeFileId,
      imageFileId,
      feedback,
    } = body;

    if (!id || !resumeFileId || !imageFileId) {
      return new Response("Missing required fields", { status: 400 });
    }

    await db.insert(resumes).values({
      id,
      userId: session.user.id,
      companyName,
      jobTitle,
      jobDescription,
      resumeFileId,
      imageFileId,
      feedback: feedback ? JSON.stringify(feedback) : null,
    });

    return { success: true, id };
  }

  return new Response("Method not allowed", { status: 405 });
};
