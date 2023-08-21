import type {
  LoaderArgs,
  LoaderFunction,
  V2_MetaFunction,
} from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";

import { getRandomStream } from "~/twitch";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "twitchroulette.net" },
    { name: "description", content: "Find a new streamer friend" },
  ];
};

export const loader: LoaderFunction = async (args: LoaderArgs) => {
  const { getSession } = args.context.sessionStorage;

  const session = await getSession(args.request?.headers?.get("Cookie"));
  const filters = session.get("filters");

  const TWITCH_KV = args.context.TWITCH_KV;

  const randomStream = await getRandomStream(TWITCH_KV, filters);

  return redirect(`/stream/${randomStream?.broadcaster.login}`);
};
