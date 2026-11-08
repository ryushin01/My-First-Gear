#!/usr/bin/env node
// Drizzle 마이그레이션 적용. 운영 배포(Vercel 빌드)와 로컬 DB가 같은 방식으로 적용한다.
// 사용: node packages/db/scripts/migrate.mjs  (DATABASE_URL_UNPOOLED → DATABASE_URL → MFG_DATABASE_URL)
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { fileURLToPath } from "node:url";
import pg from "pg";

export const MIGRATIONS_DIR = fileURLToPath(new URL("../migrations", import.meta.url));

export async function migrateDatabase(connectionString) {
  const pool = new pg.Pool({ connectionString, max: 1 });
  try {
    await migrate(drizzle(pool), { migrationsFolder: MIGRATIONS_DIR });
  } finally {
    await pool.end();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  // 프리뷰 배포는 Neon 프리뷰 브랜치를 켰을 때만(MFG_MIGRATE_ON_PREVIEW=1) 적용한다. 운영 DB에 미리 적용하지 않게.
  if (process.env.VERCEL_ENV === "preview" && process.env.MFG_MIGRATE_ON_PREVIEW !== "1") {
    console.log("[migrate] 프리뷰 배포라 마이그레이션을 건너뜁니다.");
    process.exit(0);
  }
  // 마이그레이션은 연결 풀러(pgbouncer)를 거치지 않는 직접 연결로 적용한다.
  const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? process.env.MFG_DATABASE_URL;
  if (!url) {
    console.log("[migrate] DB 연결 문자열이 없어 마이그레이션을 건너뜁니다.");
    process.exit(0);
  }
  await migrateDatabase(url);
  console.log("[migrate] 마이그레이션을 적용했습니다.");
}
