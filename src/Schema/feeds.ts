import { eq, sql } from "drizzle-orm";
import { RSSFeed } from "../feed.js";
import { db } from "./db.js";
import { feeds, users } from "./schema.js";

export type Feed = typeof feeds.$inferSelect;
export type User = typeof users.$inferSelect;
export type FeedUser = {
    name: string;
    url: string;
    user_name: string;
};

export function printFeed(feed: FeedUser) {
    console.log(`User ${feed.user_name} feeds:\n`);
    console.log(`Feed ${feed.name}\nurl: ${feed.url}`);
}

export async function getFeeds(): Promise<FeedUser[]> {
    const feed_user: FeedUser[] = (await db.select({name: feeds.name, url: feeds.url, user_name: users.name}).from(feeds).innerJoin(users, eq(feeds.user_id, users.id)));
    return feed_user;
}

export async function getFeed(url: string) {
    const [result] = await db.select().from(feeds).where(eq(feeds.url, url));
    return result;
}

// Accepts userId directly so the caller (CommandHandler) doesn't need
// a separate readConfig() + DB lookup — it already holds this.user.id.
export async function createFeed(name: string, url: string, userId: string) {
    const [result] = await db.insert(feeds).values({ name: name, url: url, user_id: userId }).returning();
    return result;
}

export async function markFeedFetched(feed_url: string) {
    const [result] = await db.update(feeds).set({ last_fetched_at: new Date() }).where(eq(feeds.url, feed_url)).returning();
    return result;
}

export async function getNextFeedToFetch() {
    const [result] = await db.select().from(feeds).orderBy(sql`last_fetched_at ASC NULLS FIRST`).limit(1);
    return result;
}