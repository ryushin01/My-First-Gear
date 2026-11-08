import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

export type Db = NodePgDatabase<typeof schema>;

let cached: { db: Db; pool: pg.Pool } | null = null;

/** 연결 문자열: MFG_DATABASE_URL(로컬·테스트) → DATABASE_URL(Vercel의 Neon 연동이 넣어 주는 값) */
export function resolveConnectionString(): string | null {
  return process.env.MFG_DATABASE_URL || process.env.DATABASE_URL || null;
}

export function hasDatabase(): boolean {
  return resolveConnectionString() !== null;
}

export function getDb(): Db {
  if (cached) return cached.db;
  const connectionString = resolveConnectionString();
  if (!connectionString) throw new Error("데이터베이스 연결 문자열이 없습니다. DATABASE_URL 또는 MFG_DATABASE_URL을 설정하세요.");
  const pool = new pg.Pool({ connectionString, max: 5 });
  cached = { pool, db: drizzle(pool, { schema }) };
  return cached.db;
}

/** 테스트에서 연결을 바꿀 때 쓴다. */
export function createDb(connectionString: string): { db: Db; close: () => Promise<void> } {
  const pool = new pg.Pool({ connectionString, max: 2 });
  return { db: drizzle(pool, { schema }), close: () => pool.end() };
}
