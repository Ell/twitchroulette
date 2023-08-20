import type {
  LoaderArgs,
  LoaderFunction,
  V2_MetaFunction,
} from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import ReactTwitchEmbedVideo from "react-twitch-embed-video";

import type { ChannelTag } from "~/twitch";
import { getRandomStream } from "~/twitch";
import { Link, useLoaderData } from "@remix-run/react";

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

  return json({ stream: randomStream });
};

export default function Spin() {
  const loaderData = useLoaderData<typeof loader>();
  const { stream } = loaderData;

  return (
    <div className="flex flex-col text-slate-100 w-full h-full">
      <div className="flex flex-row w-full h-16 bg-slate-700 justify-between">
        <div className="p-4 pt-3.5">
          <Link to="/" className="text-center text-2xl font-extrabold">
            Twitchroulette
          </Link>
        </div>
        <div className="pt-3 pr-3">
          <Link
            to="/spin"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Spin (R)
          </Link>
        </div>
      </div>
      <div className="w-full h-full">
        <ReactTwitchEmbedVideo
          channel={stream.broadcaster.login}
          height="100%"
          width="100%"
          allowfullscreen
        />
      </div>
      <div className="flex flex-row w-full h-12 bg-slate-700">
        <div className="flex flex-row justify-between w-full p-2 pt-2 pl-4">
          <div className="flex flex-row">
            <Link
              to={`https://twitch.tv/${stream.broadcaster.login}`}
              className="mr-1 underline"
            >
              {stream.broadcaster.login}
            </Link>
            is playing{" "}
            <p className="underline ml-1 mr-1">
              {stream.game?.name ?? "No game"}
            </p>{" "}
            with <p className="underline ml-1">{stream.viewersCount} viewers</p>
          </div>
        </div>
        {stream.freeformTags.length > 0 && (
          <div className="text-xs p-3 pr-4 hidden sm:block w-full text-end">
            Tagged:{" "}
            {stream.freeformTags
              .filter((t: ChannelTag) => t !== null)
              .map((t: ChannelTag) => t?.name ?? "no-tag")
              .join(", ")}
          </div>
        )}
      </div>
    </div>
  );
}
