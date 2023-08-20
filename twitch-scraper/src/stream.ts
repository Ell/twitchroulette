export type Broadcaster = {
	id: string;
	displayName: string;
	login: string;
}

export type ChannelTag = {
	id: string;
	name: string;
}

export type Game = {
	id: string;
	name: string;
	slug: string;
	boxArtURL: string;
}

export type StreamEdge = {
	id: string;
	title: string;
	previewImageURL: string;
	type: string;
	viewersCount: number;
}

export type Node = StreamEdge & {
	broadcaster: Broadcaster;
	freeformTags: ChannelTag[];
	game: Game;
}

export type Edge = {
	cursor: string;
	node: Node;
}

export type GQLResult = {
	data: {
		streams: {
			edges: Edge[],
			pageInfo: {
				hasNextPage: boolean,
			},
		},
	},
}

export async function getStreamEdges(previousCursor?: string): Promise<GQLResult[]> {
	const baseURL = "https://gql.twitch.tv/gql";

	const headers = {
		"Client-ID": "ue6666qo983tsx6so1t0vnawi233wa",
		"Accept": "application/json",
		"Content-Type": "application/json",
	}

	const payload = [{
		operationName: "BrowsePage_Popular",
		extensions: {
			persistedQuery: {
				sha256Hash: "19cd6b171185fa3937c4fd6f80363a7a38a7dc269c43eb205732159bc932cb01",
				version: 1,
			},
		},
		variables: {
			cursor: previousCursor ?? null,
			imageWidth: 50,
			limit: 30,
			options: {
				broadcasterLanguages: [],
				freeformTags: null,
				recommendationsContext: {
					platform: "web",
				},
				requestID: "JIRA-VXP-2397",
				sort: "VIEWER_COUNT_ASC",
				tags: [],
			},
			platformType: "all",
			sortTypeIsRecency: false,
		},
	}];

	const response = await fetch(baseURL, {
		method: "POST",
		headers,
		body: JSON.stringify(payload),
	});

	return response.json();
}

export async function fetchStreamCollection(limit = 10): Promise<Edge[]> {
	const edges: Edge[] = [];

	const initialEdges = await getStreamEdges();

	edges.push(...initialEdges[0].data.streams.edges);

	for (let i = 1; i < limit; i++) {
		const cursor = edges[edges.length - 1].cursor;
		const results = await getStreamEdges(cursor);

		edges.push(...results[0].data.streams.edges);
	}

	return edges;
}
