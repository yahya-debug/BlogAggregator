import { eq } from "drizzle-orm";
import { db } from "./db.js";
import { users } from "./schema.js";

export type User = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
}

export async function getUsers() {
    const result = await db.select({name: users.name}).from(users);
    return result;
}

export async function createUser(name: string) {
    const [result] = await db.insert(users).values({ name: name }).returning();
    return result;
}

export async function getUser(name: string): Promise<User> {
    const [result] = await db.select().from(users).where(eq(users.name, name));
    return result;
}

export async function deleteAll() {
    return await db.delete(users).returning({ name: users.name });
}