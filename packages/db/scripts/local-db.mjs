// 로컬·테스트용 Postgres. PGlite(WASM Postgres)를 pg-gateway로 감싸 일반 Postgres처럼 TCP로 접속한다.
import { PGlite } from "@electric-sql/pglite";
import { existsSync, readFileSync } from "node:fs";
import { createServer } from "node:net";
import { join } from "node:path";
import { fromNodeSocket } from "pg-gateway/node";
import { migrateDatabase } from "./migrate.mjs";

/** PGlite가 쓰는 PostgreSQL 버전(예: "17.5"). */
async function serverVersionOf(db) {
  const { rows } = await db.query("show server_version");
  return rows[0].server_version;
}

/**
 * PGlite를 연다. PostgreSQL 주 버전이 다른 PGlite로 만든 폴더는 열 수 없어서(PGlite를 올렸을 때),
 * "PGlite failed to initialize properly" 대신 어느 버전 폴더인지와 할 일을 알려 준다.
 */
async function openPglite(directory) {
  try {
    return await PGlite.create(directory ? { dataDir: directory } : undefined);
  } catch (error) {
    const versionFile = directory ? join(directory, "PG_VERSION") : "";
    if (!versionFile || !existsSync(versionFile)) throw error;
    const made = readFileSync(versionFile, "utf8").trim();
    const probe = await PGlite.create();
    const now = (await serverVersionOf(probe)).split(".")[0];
    await probe.close();
    if (made === now) throw error;
    throw new Error(
      `[local-db] ${directory}는 PostgreSQL ${made}에서 만든 폴더라 PostgreSQL ${now}인 지금 PGlite로 열 수 없습니다. ` +
        "폴더를 지우고 다시 실행하면 새로 만들고 마이그레이션을 적용합니다(로컬에서 넣은 주문·상담 등은 지워집니다).",
      { cause: error },
    );
  }
}

/**
 * 로컬 DB를 띄우고 마이그레이션을 적용한다.
 * directory를 주면 파일로 남기고, 없으면 메모리에서만 쓴다.
 */
export async function startLocalDb({ directory } = {}) {
  const db = await openPglite(directory);
  // 접속하는 클라이언트에 알리는 서버 버전. PGlite를 올리면 함께 바뀌도록 실제 값을 쓴다.
  const serverVersion = `${await serverVersionOf(db)} (pglite)`;
  const sockets = new Set();
  const server = createServer((socket) => {
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
    fromNodeSocket(socket, {
      serverVersion,
      auth: { method: "trust" },
      async onMessage(data, { isAuthenticated }) {
        if (!isAuthenticated) return;
        return db.execProtocolRaw(data);
      },
    }).catch((error) => {
      if (!(error instanceof Error && error.message.includes("ECONNRESET"))) console.error("[local-db]", error);
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  const url = `postgres://postgres@127.0.0.1:${port}/postgres`;
  await migrateDatabase(url);
  return {
    url,
    async stop() {
      for (const socket of sockets) socket.destroy();
      await new Promise((resolve) => server.close(resolve));
      await db.close();
    },
  };
}
