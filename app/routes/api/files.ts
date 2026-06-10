import type { Route } from "./+types/api/files";
import { db } from "~/lib/db";
import { files } from "~/lib/schema";
import { auth } from "~/lib/auth";
import { eq } from "drizzle-orm";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });
  
  const userFiles = await db.select({
    id: files.id,
    path: files.path,
    name: files.name,
    mimeType: files.mimeType,
    createdAt: files.createdAt,
  }).from(files).where(eq(files.userId, session.user.id));
  
  return userFiles.map((f) => ({
    id: f.id,
    uid: f.id,
    name: f.name,
    path: f.path,
    is_dir: false,
    parent_id: "",
    parent_uid: "",
    created: new Date(f.createdAt).getTime(),
    modified: new Date(f.createdAt).getTime(),
    accessed: new Date(f.createdAt).getTime(),
    size: 0,
    writable: true,
  })) as FSItem[];
};

export const action = async ({ request }: Route.ActionArgs) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });
  
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return new Response("No file", { status: 400 });
  
  const buffer = Buffer.from(await file.arrayBuffer());
  const id = crypto.randomUUID();
  
  await db.insert(files).values({
    id,
    userId: session.user.id,
    name: file.name,
    path: id,
    mimeType: file.type,
    data: buffer,
  });
  
  return {
    id,
    uid: id,
    name: file.name,
    path: id,
    is_dir: false,
    parent_id: "",
    parent_uid: "",
    created: Date.now(),
    modified: Date.now(),
    accessed: Date.now(),
    size: file.size,
    writable: true,
  } as FSItem;
};
