import { defineConfig, devices } from "@playwright/test";

const SHOP = Number(process.env.E2E_SHOP_PORT ?? 3210);
const ADMIN = Number(process.env.E2E_ADMIN_PORT ?? 3211);

/** 어드민과 쇼핑몰을 같은 로컬 DB로 띄워 함께 검사한다. 두 앱 모두 먼저 빌드해 둔다. */
export default defineConfig({
  testDir: "./e2e",
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: `http://localhost:${ADMIN}`, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], channel: process.env.CI ? undefined : "chrome" } },
    { name: "mobile", use: { ...devices["Pixel 7"], channel: process.env.CI ? undefined : "chrome" } },
  ],
  webServer: {
    command: "node ../../packages/db/scripts/with-db.mjs -- node e2e/serve-both.mjs",
    url: `http://localhost:${ADMIN}/login`,
    reuseExistingServer: false,
    env: { E2E_SHOP_PORT: String(SHOP), E2E_ADMIN_PORT: String(ADMIN) },
  },
});
