import { XMLParser } from "fast-xml-parser";
import { createPost } from "./Schema/posts.js";
import { getNextFeedToFetch, markFeedFetched } from "./Schema/feeds.js";

export type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

function parsePubDate(pubDate: string): Date {
    const d = new Date(pubDate);
    return isNaN(d.getTime()) ? new Date() : d;
}

export async function fetchFeed(feedUrl: string) {
    const raw = await fetch(feedUrl, {
        method: 'GET',
        headers: {
            'User-Agent': 'gator',
        },
    });
    const data = await raw.text();
    const parser = new XMLParser({ processEntities: false });

    const parsed: RSSFeed = parser.parse(data).rss;

    if (!parsed.channel || !parsed.channel.title || !parsed.channel.link || !parsed.channel.description)
        throw new Error("The data has some missing fields");

    let items: RSSItem[] = [];
    if (parsed.channel.item)
        items = Array.isArray(parsed.channel.item) ? parsed.channel.item : [parsed.channel.item];

    items = items.filter(item => item.description && item.link && item.pubDate && item.title);
    parsed.channel.item = items;
    return parsed;
}

export async function scrapeFeeds() {
    const next = await getNextFeedToFetch();
    const feed = await fetchFeed(next.url);
    await markFeedFetched(next.url);

    console.log(`Fetching feed: ${feed.channel.title}`);

    for (const item of feed.channel.item) {
        const saved = await createPost(item.title, item.link, next.id, item.description, parsePubDate(item.pubDate));
        if (saved)
            console.log(`  Saved: ${item.title}`);
    }
}
