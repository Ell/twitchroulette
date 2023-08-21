import type {
  LoaderArgs,
  LoaderFunction,
  V2_MetaFunction,
} from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import ReactTwitchEmbedVideo from "react-twitch-embed-video";
import { Link, useLoaderData, useNavigate } from "@remix-run/react";

import type { ChannelTag } from "~/twitch";
import { getStream } from "~/twitch";
import type { KeyboardEvent, KeyboardEventHandler } from "react";
import { useCallback, useEffect } from "react";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "twitchroulette.net" },
    { name: "description", content: "Find a new streamer friend" },
  ];
};

export const loader: LoaderFunction = async (args: LoaderArgs) => {
  const TWITCH_KV = args.context.TWITCH_KV;

  const streamer = args.params.streamer;

  let stream = undefined;
  if (streamer) {
    stream = await getStream(TWITCH_KV, streamer);
  }

  return json({ stream });
};

export default function Stream() {
  const loaderData = useLoaderData<typeof loader>();
  const { stream } = loaderData;

  const navigate = useNavigate();

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.code === "KeyR") {
        navigate("/spin");
      }
    },
    [navigate]
  );

  useEffect(() => {
    // @ts-ignore
    document.addEventListener("keydown", handleKeyPress);

    return () => {
      // @ts-ignore
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <div className="flex flex-col text-slate-100 w-full h-full">
      <div className="flex flex-row w-full h-16 bg-slate-700 justify-between">
        <div className="p-4 pt-3.5">
          <Link to="/" className="text-center text-2xl font-extrabold">
            Twitchroulette
          </Link>
        </div>
        <div className="pt-3 pr-3">
          {stream && (
            <Link
              to="/spin"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Spin (R)
            </Link>
          )}
        </div>
      </div>
      {stream && (
        <div className="w-full h-full">
          <ReactTwitchEmbedVideo
            channel={stream.broadcaster.login}
            height="100%"
            width="100%"
            allowfullscreen
          />
        </div>
      )}
      {!stream && (
        <div className="flex flex-col justify-center w-full h-full">
          <div className="flex flex-row w-full justify-center h-1/2">
            <Link to="/" className="underline">
              No streams match your filters. Try editing them.
            </Link>
          </div>
        </div>
      )}
      <div className="flex flex-row w-full h-12 bg-slate-700">
        {stream && (
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
              with{" "}
              <p className="underline ml-1">{stream.viewersCount} viewers</p>
            </div>
          </div>
        )}
        {stream && stream.freeformTags.length > 0 && (
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
