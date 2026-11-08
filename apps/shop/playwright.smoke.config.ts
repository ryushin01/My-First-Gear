import { defineConfig, devices } from "@playwright/test";

/** 운영 스모크 테스트 (서버를 띄우지 않고 실제 주소를 검사한다) */
export default defineConfig({
  testDir: "./smoke",
  retries: 2, // 배포 직후 콜드 스타트를 감안한다
  reporter: process.env.CI ? "github" : "list",
  use: { ...devices["Desktop Chrome"], channel: process.env.CI ? undefined : "chrome" },
});
