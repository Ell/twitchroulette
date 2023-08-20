import type { FilterSet } from "~/components/FilterSelectModal";

export type Broadcaster = {
  id: string;
  displayName: string;
  login: string;
};

export type ChannelTag = {
  id: string;
  name: string;
};

export type Game = {
  id: string;
  name: string;
  slug: string;
  boxArtURL: string;
};

export type StreamEdge = {
  id: string;
  title: string;
  previewImageURL: string;
  type: string;
  viewsCount: number;
};

export type Node = StreamEdge & {
  broadcaster: Broadcaster;
  freeformTags: ChannelTag[];
  game: Game;
};

export async function getGames(kv: KVNamespace): Promise<Game[]> {
  const response = await kv.get("twitch:games");

  if (!response) return [];

  return JSON.parse(response);
}

export async function getTags(kv: KVNamespace): Promise<ChannelTag[]> {
  const response = await kv.get("twitch:tags");

  if (!response) return [];

  return JSON.parse(response);
}

export async function getStreams(kv: KVNamespace): Promise<Node[]> {
  const response = await kv.get("twitch:streams");

  if (!response) return [];

  return JSON.parse(response);
}

function applyStreamFilters(filters: FilterSet, streams: Node[]): Node[] {
  if (filters.tagBlackList) {
    const filterNames = filters.tagBlackList.map((filter) => filter.name);

    streams = streams.filter((stream) => {
      let hasTag = false;

      const streamTags = stream.freeformTags.map((t) => t.name);
      for (let i = 0; i < streamTags.length; i++) {
        const tag = streamTags[i];

        if (filterNames.includes(tag)) {
          hasTag = true;
          break;
        }
      }

      return !hasTag;
    });
  }

  if (filters.gameBlackList) {
    const filterIds = filters.gameBlackList.map((filter) => filter.id);

    streams = streams.filter((stream) => {
      return !filterIds.includes(stream.id);
    });
  }

  return streams;
}

export async function getRandomStream(
  kv: KVNamespace,
  filters?: FilterSet
): Promise<Node> {
  let streams = await getStreams(kv);

  if (filters) {
    streams = applyStreamFilters(filters, streams);
  }

  return streams[Math.floor(Math.random() * streams.length)];
}
