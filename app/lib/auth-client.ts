import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: typeof window === "undefined" ? "http://localhost:5173" : undefined,
});
