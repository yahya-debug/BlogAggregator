import { desc, eq } from "drizzle-orm";
import { db } from "./db.js";
import { feed_follows, posts } from "./schema.js";

export type Post = typeof posts.$inferSelect;

export async function createPost(title: string, url: string, feed_id: string,description?: string, published_at?: Date) {
    const [result] = await db
        .insert(posts)
        .values({ title, url, feed_id, description, published_at: published_at ?? new Date() })
        .onConflictDoNothing()
        .returning();
    return result; // undefined on duplicate URL
}

export async function getPostsForUser(user_id: string, limit: number = 2): Promise<Post[]> {
    const result = await db
        .select({ post: posts })
        .from(posts)
        .innerJoin(feed_follows, eq(posts.feed_id, feed_follows.feed_id))
        .where(eq(feed_follows.user_id, user_id))
        .orderBy(desc(posts.published_at))
        .limit(limit);
    return result.map(r => r.post);
}
