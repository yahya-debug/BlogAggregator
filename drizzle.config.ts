// configuration for migrations

import { defineConfig } from "drizzle-kit";
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  schema: "src/Schema/schema.ts",
  out: "src/Schema",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.CONNECTION || "",
  },
});