#!/usr/bin/env node
// 비밀값·.env 없이 쇼핑몰(3000)과 어드민(3001)을 한 번에 띄운다. 루트의 `pnpm dev`, `pnpm start`가 부른다.
// - DB 연결 문자열(MFG_DATABASE_URL·DATABASE_URL)이 없으면 로컬 Postgres(PGlite, apps/shop/.local-db)를 띄우고
//   마이그레이션(시드 상품·데모 회원 포함)을 적용해 두 앱이 같은 DB를 쓴다. 인터넷 연결이 없어도 된다.
// - 연결 문자열이 있으면 그 DB를 그대로 쓴다.
// 사용: node packages/db/scripts/local-stack.mjs <dev|start>
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { startLocalDb } from "./local-db.mjs";

const mode = process.argv[2];
if (mode !== "dev" && mode !== "start") {
  console.error("사용: node packages/db/scripts/local-stack.mjs <dev|start>");
  process.exit(1);
}

const root = new URL("../../../", import.meta.url);
const SHOP_PORT = process.env.MFG_SHOP_PORT ?? "3000";
const ADMIN_PORT = process.env.MFG_ADMIN_PORT ?? "3001";

let db = null;
if (!process.env.MFG_DATABASE_URL && !process.env.DATABASE_URL) {
  db = await startLocalDb({ directory: fileURLToPath(new URL("apps/shop/.local-db", root)) });
  console.log(`[local-stack] 로컬 DB(PGlite) ${db.url} · 마이그레이션 적용 완료`);
}

const env = {
  ...process.env,
  ...(db && { MFG_DATABASE_URL: db.url }),
  // 어드민에서 바꾼 가격·노출을 쇼핑몰에 바로 반영한다(두 앱이 같은 값을 써야 함).
  MFG_SHOP_URL: process.env.MFG_SHOP_URL ?? `http://localhost:${SHOP_PORT}`,
  MFG_REVALIDATE_SECRET: process.env.MFG_REVALIDATE_SECRET ?? "local-revalidate-secret",
};

const apps = [
  ["apps/shop", SHOP_PORT],
  ["apps/admin", ADMIN_PORT],
].map(([dir, port]) =>
  spawn("pnpm", ["exec", "next", mode, "--port", port], {
    cwd: fileURLToPath(new URL(dir, root)),
    stdio: "inherit",
    env,
    shell: process.platform === "win32",
  }),
);
console.log(`[local-stack] 쇼핑몰 http://localhost:${SHOP_PORT} · 어드민 http://localhost:${ADMIN_PORT}`);

let stopping = false;
async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of apps) child.kill("SIGTERM");
  await db?.stop();
  process.exit(code);
}
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => void stop(0));
for (const child of apps) child.on("exit", (code) => void stop(code ?? 0));
