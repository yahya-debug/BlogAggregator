import { PgUUIDBuilderInitial } from "drizzle-orm/pg-core";
import { db } from "./db.js";
import { feed_follows, feeds, users } from "./schema.js";
import { and, eq } from "drizzle-orm";

export type FeedFollow = typeof feed_follows.$inferSelect;

export async function createFeedFollow(user_id: string, feed_id: string) {
    const [inserted] = await db.insert(feed_follows).values({ user_id: user_id, feed_id: feed_id }).returning();
    
    if (!inserted)
        throw new Error("Failed to insert");

    const [result] = await db.select({
         id: feed_follows.id,
         user_id: feed_follows.user_id,
         feed_id: feed_follows.feed_id,
         createdAt: feed_follows.createdAt,
         updatedAt: feed_follows.updatedAt,
         userName: users.name,
         feedName: feeds.name
     }).from(feed_follows).innerJoin(users, eq(feed_follows.user_id, users.id))
     .innerJoin(feeds, eq(feed_follows.feed_id, feeds.id))
     .where(eq(feed_follows.id, inserted.id));

    return result;
}

export async function getFeedFollowForUser(user_id: string) {
    const result = await db.select({
         id: feed_follows.id,
         user_id: feed_follows.user_id,
         feed_id: feed_follows.feed_id,
         createdAt: feed_follows.createdAt,
         updatedAt: feed_follows.updatedAt,
         userName: users.name,
         feedName: feeds.name
     }).from(feed_follows).innerJoin(users, eq(feed_follows.user_id, users.id))
     .innerJoin(feeds, eq(feed_follows.feed_id, feeds.id))
     .where(eq(feed_follows.user_id, user_id));

     return result;
}

export async function removeFeedFollow(user_id: string, feed_url: string) {
    const [{ feed_id }] = await db.select({ feed_id: feeds.id }).from(feed_follows).innerJoin(feeds, eq(feed_follows.feed_id, feeds.id));
    const [result] = await db.delete(feed_follows).where(and(eq(feed_follows.user_id, user_id), eq(feed_follows.feed_id, feed_id)));

    return result;
}