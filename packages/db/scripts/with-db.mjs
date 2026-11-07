#!/usr/bin/env node
// 로컬 Postgres(@netlify/database-dev)를 띄우고 마이그레이션을 적용한 뒤 명령을 실행한다.
// 사용: node packages/db/scripts/with-db.mjs [--persist <dir>] -- <명령> [인자...]
// 명령에는 MFG_DATABASE_URL이 전달된다. 명령이 끝나면 DB도 끈다.
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { NetlifyDB } from "@netlify/database-dev";

const args = process.argv.slice(2);
const sep = args.indexOf("--");
const opts = sep === -1 ? [] : args.slice(0, sep);
const command = sep === -1 ? args : args.slice(sep + 1);
const persistAt = opts.indexOf("--persist");
const directory = persistAt === -1 ? undefined : opts[persistAt + 1];

const migrations = fileURLToPath(new URL("../../../apps/shop/netlify/database/migrations", import.meta.url));
const db = new NetlifyDB(directory ? { directory } : {});
const url = await db.start();
const applied = await db.applyMigrations(migrations);
console.log(`[with-db] ${url.replace(/:[^:@/]+@/, ":***@")} · 마이그레이션 ${applied.length}개 적용`);

if (command.length === 0) {
  console.log("[with-db] 명령이 없어 DB만 실행합니다. Ctrl+C로 끕니다.");
  console.log(`MFG_DATABASE_URL=${url}`);
} else {
  const child = spawn(command[0], command.slice(1), {
    stdio: "inherit",
    env: { ...process.env, MFG_DATABASE_URL: url },
    shell: process.platform === "win32",
  });
  child.on("exit", async (code) => {
    await db.stop();
    process.exit(code ?? 0);
  });
  for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
}
