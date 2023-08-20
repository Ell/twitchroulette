import {ChannelTag, fetchStreamCollection, Game, StreamEdge} from "./stream";

export interface Env {
	TWITCH_KV: KVNamespace;
}

async function scrapeTwitchStreams(env: Env) {
	const edgeCollection = await fetchStreamCollection(100);

	const games: { [key: string]: Game } = {};
	const tags: { [key: string]: ChannelTag } = {};
	const streams: { [key: string]: StreamEdge } = {};

	edgeCollection.forEach(edge => {
		const node = edge.node;

		if (node.viewsCount >= 5) {
			return;
		}

		streams[node.id] = node;

		if (node.game && node.game.id) games[node.game.id] = node.game;
		if (tags) node.freeformTags.forEach(tag => tags[tag.name] = tag);
	});

	const gamesList = Object.values(games);
	await env.TWITCH_KV.put("twitch:games", JSON.stringify(gamesList));
	console.log(`wrote ${gamesList.length} games`);

	const tagsList = Object.values(tags);
	await env.TWITCH_KV.put("twitch:tags", JSON.stringify(tagsList));
	console.log(`wrote ${tagsList.length} tags`);

	const streamsList = Object.values(streams);
	await env.TWITCH_KV.put("twitch:streams", JSON.stringify(streamsList));
	console.log(`wrote ${streamsList.length} streams`);
}

export default {
	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
		await scrapeTwitchStreams(env);
	},
};
