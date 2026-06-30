import { pgTable, timestamp, uuid, text, unique } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  name: text("name").notNull().unique(),
});

export const feeds = pgTable("feeds", {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
    last_fetched_at: timestamp("last_fetched_at").defaultNow(),
    name: text("name").notNull(),
    url: text("url").notNull().unique(),
    user_id: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }),
});

export const feed_follows = pgTable("feed_follows", {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
    user_id: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }),
    feed_id: uuid("feed_id").references(() => feeds.id, { onDelete: 'cascade' }),
}, (t) => [
    unique().on(t.user_id, t.feed_id),
]);


export const posts = pgTable("posts", {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
    title: text("title").notNull(),
    url: text("url").unique().notNull(),
    description: text("description"),
    published_at: timestamp("published_at").notNull().defaultNow(),
    feed_id: uuid("feed_id").references(() => feeds.id, { onDelete: 'cascade' }),
})