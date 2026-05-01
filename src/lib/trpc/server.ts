import "server-only";
import { headers } from "next/headers";
import { cache } from "react";
import { createCaller } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

const createContext = cache(async () => {
  const h = await headers();
  return createTRPCContext({ headers: h });
});

export const api = createCaller(createContext);
