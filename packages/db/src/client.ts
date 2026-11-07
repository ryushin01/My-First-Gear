import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { getConnectionString } from "@netlify/database";
import pg from "pg";
import * as schema from "./schema";

export type Db = NodePgDatabase<typeof schema>;

let cached: { db: Db; pool: pg.Pool } | null = null;

/** 연결 문자열: MFG_DATABASE_URL(어드민·테스트) → NETLIFY_DB_URL → Netlify가 정해 주는 값 */
export function resolveConnectionString(): string | null {
  if (process.env.MFG_DATABASE_URL) return process.env.MFG_DATABASE_URL;
  if (process.env.NETLIFY_DB_URL) return process.env.NETLIFY_DB_URL;
  try {
    return getConnectionString();
  } catch {
    return null;
  }
}

export function hasDatabase(): boolean {
  return resolveConnectionString() !== null;
}

export function getDb(): Db {
  if (cached) return cached.db;
  const connectionString = resolveConnectionString();
  if (!connectionString) throw new Error("데이터베이스 연결 문자열이 없습니다. MFG_DATABASE_URL 또는 NETLIFY_DB_URL을 설정하세요.");
  const pool = new pg.Pool({ connectionString, max: 5 });
  cached = { pool, db: drizzle(pool, { schema }) };
  return cached.db;
}

/** 테스트에서 연결을 바꿀 때 쓴다. */
export function createDb(connectionString: string): { db: Db; close: () => Promise<void> } {
  const pool = new pg.Pool({ connectionString, max: 2 });
  return { db: drizzle(pool, { schema }), close: () => pool.end() };
}
