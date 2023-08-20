import type {
  LoaderArgs,
  LoaderFunction,
  V2_MetaFunction,
} from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";

import { getGames, getTags } from "~/twitch";
import type { FilterSet } from "~/components/FilterSelectModal";
import { FilterSelectModal } from "~/components/FilterSelectModal";

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

  const games = await getGames(TWITCH_KV);
  const tags = await getTags(TWITCH_KV);

  return json({ games, tags, filters });
};

export default function Index() {
  const loaderData = useLoaderData<typeof loader>();
  const { games, tags, filters } = loaderData;

  const onFilterSetChanged = async (filterSet: FilterSet) => {
    await fetch("/filters", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(filterSet),
    });
  };

  return (
    <div className="flex flex-col justify-center sm:px-8 lg:px-12 pt-24 md:pt-36 text-slate-100">
      <div className="w-full p-4">
        <h1 className="text-center text-4xl md:text-6xl font-extrabold">
          Twitchroulette
        </h1>
        <p className="mt-4 text-center text-sm">
          Find a new friend among Twitch streamers who need you the most
        </p>
        <div className="mt-12 md:mt-16 sm:mx-auto sm:w-full sm:max-w-md">
          <Link
            to="/spin"
            type="button"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Spin
          </Link>
        </div>
        <div className="mt-4 text-center">
          <FilterSelectModal
            buttonText={"+ edit filters"}
            games={games ?? []}
            tags={tags ?? []}
            onFilterSetSaved={onFilterSetChanged}
            filterSet={filters}
          />
        </div>
      </div>
    </div>
  );
}
