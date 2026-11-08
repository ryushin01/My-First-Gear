import { expect, test } from "@playwright/test";

/**
 * 운영 스모크 테스트: 배포 직후 실제 주소에서 읽기만 한다 (데이터를 바꾸지 않음).
 * SMOKE_SHOP_URL, SMOKE_ADMIN_URL로 주소를 바꿀 수 있다.
 */
const SHOP = process.env.SMOKE_SHOP_URL ?? "https://my-first-gear.vercel.app";
const ADMIN = process.env.SMOKE_ADMIN_URL ?? "https://my-first-gear-admin.vercel.app";

test("쇼핑몰 주요 화면이 응답한다", async ({ request }) => {
  for (const path of ["/", "/gear/gpu", "/product/antec-torque", "/build", "/build/quick", "/search?q=AM5", "/login"]) {
    expect((await request.get(SHOP + path)).status(), path).toBe(200);
  }
});

test("DB에 연결돼 시드 후기를 보여 준다", async ({ page }) => {
  await page.goto(SHOP + "/product/antec-torque");
  await expect(page.getByText("부품이 다 보여서 책상 위 오브제가 됐습니다.")).toBeVisible();
});

test("검색 엔진·공유 파일과 OG 이미지", async ({ request }) => {
  expect((await request.get(SHOP + "/robots.txt")).status()).toBe(200);
  expect(await (await request.get(SHOP + "/sitemap.xml")).text()).toContain(SHOP.replace(/\/$/, "") + "/product/");
  const og = await request.get(SHOP + "/product/antec-torque/opengraph-image");
  expect(og.status()).toBe(200);
  expect(og.headers()["content-type"]).toContain("image/png");
});

test("크론 엔드포인트는 비밀 값 없이 거절한다", async ({ request }) => {
  expect((await request.get(SHOP + "/api/cron/reset-demo")).status()).toBe(401);
});

test("어드민은 로그인 화면으로 보내고 검색에 노출하지 않는다", async ({ request }) => {
  const res = await request.get(ADMIN + "/login");
  expect(res.status()).toBe(200);
  expect(res.headers()["x-robots-tag"]).toContain("noindex");
});
