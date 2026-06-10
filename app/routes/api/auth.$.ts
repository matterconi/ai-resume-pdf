import type { Route } from "./+types/api.auth.$";
import { auth } from "~/lib/auth";

export const loader = async ({ request }: Route.LoaderArgs) => {
  return auth.handler(request);
};

export const action = async ({ request }: Route.ActionArgs) => {
  return auth.handler(request);
};
