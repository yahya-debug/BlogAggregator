import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema.js";
import { readConfig } from "../../src/config.js";

const config = await readConfig();
const conn = postgres(config.dbUrl);
export const db = drizzle(conn, { schema });