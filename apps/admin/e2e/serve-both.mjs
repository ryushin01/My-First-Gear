// 쇼핑몰과 어드민 프로덕션 빌드를 같은 DB(MFG_DATABASE_URL)로 함께 띄운다. E2E 전용.
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const shopPort = process.env.E2E_SHOP_PORT ?? "3210";
const adminPort = process.env.E2E_ADMIN_PORT ?? "3211";
const env = {
  ...process.env,
  MFG_SHOP_URL: `http://localhost:${shopPort}`,
  MFG_REVALIDATE_SECRET: "e2e-secret",
  MFG_ADMIN_SECRET: "e2e-admin-secret",
  CRON_SECRET: "e2e-cron-secret",
};
const apps = [
  ["../../shop", shopPort],
  ["..", adminPort],
].map(([dir, port]) =>
  spawn("pnpm", ["exec", "next", "start", "--port", port], {
    cwd: fileURLToPath(new URL(dir, import.meta.url)),
    stdio: "inherit",
    env,
  }),
);
const stop = () => apps.forEach((child) => child.kill("SIGTERM"));
process.on("SIGTERM", stop);
process.on("SIGINT", stop);
apps.forEach((child) => child.on("exit", (code) => process.exit(code ?? 0)));
