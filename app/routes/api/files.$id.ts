import type { Route } from "./+types/api/files.$id";
import { db } from "~/lib/db";
import { files } from "~/lib/schema";
import { auth } from "~/lib/auth";
import { eq, and } from "drizzle-orm";

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });
  
  const { id } = params;
  const result = await db.select().from(files).where(
    and(eq(files.id, id), eq(files.userId, session.user.id))
  ).limit(1);
  
  if (!result.length) return new Response("Not found", { status: 404 });
  
  const file = result[0];
  const data = file.data as Buffer;
  
  return new Response(data, {
    headers: {
      "Content-Type": file.mimeType || "application/octet-stream",
      "Content-Disposition": `inline; filename="${file.name}"`,
    },
  });
};

export const action = async ({ params, request }: Route.ActionArgs) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });
  
  const { id } = params;
  await db.delete(files).where(
    and(eq(files.id, id), eq(files.userId, session.user.id))
  );
  
  return { success: true };
};
