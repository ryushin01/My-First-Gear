import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";
// @ts-expect-error 로컬 DB 스크립트는 JS 모듈이다
import { startLocalDb } from "../scripts/local-db.mjs";

it("다른 PostgreSQL 주 버전으로 만든 폴더는 그 버전과 할 일을 알려 준다", async () => {
  const directory = mkdtempSync(join(tmpdir(), "mfg-local-db-"));
  try {
    // PGlite를 올리기 전에 만든 폴더(PostgreSQL 10)인 것처럼 둔다.
    writeFileSync(join(directory, "PG_VERSION"), "10\n");
    await expect(startLocalDb({ directory })).rejects.toThrow(/PostgreSQL 10에서 만든 폴더.*폴더를 지우고 다시 실행/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}, 60_000);
