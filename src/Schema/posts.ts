import { eq, sql } from "drizzle-orm";
import { db } from "./db.js";
import { feeds, posts } from "./schema.js";

export async function createPost(title: string, url: string, feed: string, description?: string) {
    const [result] = await db.insert(posts).
        values({ title: title, url: url, feed_id: feed, description: description }).returning();
    return result;
}

export async function getPostsForUser(user_id: string, limit: number = 2) {
    const result = await db.select().from(posts).innerJoin(feeds, eq(posts.feed_id, feeds.id)).
        where(eq(feeds.user_id, user_id)).orderBy(sql`posts.published_at desc`).limit(limit);
    return result;
}