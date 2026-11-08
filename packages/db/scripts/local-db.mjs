// 로컬·테스트용 Postgres. PGlite(WASM Postgres)를 pg-gateway로 감싸 일반 Postgres처럼 TCP로 접속한다.
import { PGlite } from "@electric-sql/pglite";
import { createServer } from "node:net";
import { fromNodeSocket } from "pg-gateway/node";
import { migrateDatabase } from "./migrate.mjs";

/**
 * 로컬 DB를 띄우고 마이그레이션을 적용한다.
 * directory를 주면 파일로 남기고, 없으면 메모리에서만 쓴다.
 */
export async function startLocalDb({ directory } = {}) {
  const db = await PGlite.create(directory ? { dataDir: directory } : undefined);
  const sockets = new Set();
  const server = createServer((socket) => {
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
    fromNodeSocket(socket, {
      serverVersion: "16.3 (pglite)",
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
