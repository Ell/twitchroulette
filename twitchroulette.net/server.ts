import type { SessionStorage } from "@remix-run/cloudflare";
import {
  createWorkersKVSessionStorage,
  logDevReady,
} from "@remix-run/cloudflare";
import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";
import * as build from "@remix-run/dev/server-build";
import type { FilterSet } from "~/components/FilterSelectModal";

type SessionData = {
  filters: FilterSet;
};

type SessionFlashData = {};

interface Env {
  TWITCH_KV: KVNamespace;
  sessionStorage: SessionStorage<SessionData, SessionFlashData>;
}

type Context = EventContext<Env, string, unknown>;

declare module "@remix-run/server-runtime" {
  interface AppLoadContext extends Env {}
}

if (process.env.NODE_ENV === "development") {
  logDevReady(build);
}

export const onRequest = createPagesFunctionHandler({
  build,
  getLoadContext: (context: Context) => ({
    env: context.env,
    TWITCH_KV: context.env.TWITCH_KV,
    sessionStorage: createWorkersKVSessionStorage({
      kv: context.env.TWITCH_KV,
      cookie: {
        name: "__session",
      },
    }),
  }),
  mode: process.env.NODE_ENV,
});
