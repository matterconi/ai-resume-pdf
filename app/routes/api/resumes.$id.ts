import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { db } from "~/lib/db";
import { resumes } from "~/lib/schema";
import { auth } from "~/lib/auth";
import { eq, and } from "drizzle-orm";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { id } = params;
  if (!id) return new Response("Bad request", { status: 400 });

  const result = await db
    .select()
    .from(resumes)
    .where(and(eq(resumes.id, id), eq(resumes.userId, session.user.id)))
    .limit(1);

  if (!result.length) return new Response("Not found", { status: 404 });

  return result[0];
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { id } = params;
  if (!id) return new Response("Bad request", { status: 400 });

  if (request.method === "DELETE") {
    await db
      .delete(resumes)
      .where(and(eq(resumes.id, id), eq(resumes.userId, session.user.id)));
    return { success: true };
  }

  return new Response("Method not allowed", { status: 405 });
};
