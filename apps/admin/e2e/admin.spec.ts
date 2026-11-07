import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const SHOP = `http://localhost:${process.env.E2E_SHOP_PORT ?? 3210}`;

async function login(page: Page) {
  await page.goto("/products");
  await expect(page).toHaveURL(/\/login\?next=%2Fproducts/);
  await page.getByLabel("비밀번호").fill("틀린 비밀번호");
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page.getByRole("status").filter({ hasText: "맞지 않습니다" })).toBeVisible();
  await page.getByLabel("비밀번호").fill("demo-admin");
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page).toHaveURL(/\/products$/);
}

test("로그인하지 않으면 들어갈 수 없다", async ({ page }) => {
  const response = await page.goto("/orders");
  expect(response?.url()).toContain("/login");
});

test("가격과 노출을 바꾸면 쇼핑몰에 반영된다", async ({ page }) => {
  await login(page);
  await page.getByRole("link", { name: "SSD" }).click();
  await page.getByLabel("삼성전자 990 PRO 2TB 판매가").fill("199000");
  await page.getByLabel("삼성전자 990 PRO 2TB 정가").fill("");
  await page.getByRole("button", { name: /저장\s*:\s*삼성전자 990 PRO 2TB/ }).click();
  await expect(page.getByText("삼성전자 990 PRO 2TB을(를) 저장했습니다.")).toBeVisible();

  // 정가가 판매가보다 작으면 거절
  await page.getByLabel("WD BLACK SN850X 1TB 정가").fill("1000");
  await page.getByRole("button", { name: /저장\s*:\s*WD BLACK SN850X 1TB/ }).click();
  await expect(page.getByText(/정가는 판매가보다 커야 합니다/)).toBeVisible();

  const shop = await page.context().newPage();
  await expect(async () => {
    await shop.goto(`${SHOP}/product/samsung-990-pro-2tb`);
    await expect(shop.getByText("199,000원").first()).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 15_000 });
});

test("쇼핑몰 주문을 어드민에서 처리한다", async ({ page }) => {
  const shop = await page.context().newPage();
  await shop.goto(`${SHOP}/product/samsung-ddr5-5600-32gb-kit`);
  await shop.getByRole("button", { name: "장바구니 담기" }).click();
  await shop.goto(`${SHOP}/checkout`);
  await shop.getByLabel("받는 분").fill("박데모");
  await shop.getByLabel("휴대폰 번호").fill("010-2222-3333");
  await shop.getByLabel("배송 주소").fill("부산시 가상구 데모길 2");
  await shop.getByRole("button", { name: /결제하기/ }).click();
  const orderId = (await shop.locator("dt:has-text('[Order no.]') + dd").textContent())!.trim();

  await login(page);
  await page.goto("/");
  await expect(page.getByRole("link", { name: orderId })).toBeVisible();
  await expect(page.getByText("1건").first()).toBeVisible();
  await page.getByRole("link", { name: orderId }).click();
  await expect(page.getByRole("heading", { name: `주문 ${orderId}` })).toBeVisible();
  await page.getByLabel(`${orderId} 상태`).selectOption("shipped");
  await page.getByRole("button", { name: new RegExp(`변경\\s*:\\s*${orderId}`) }).click();
  await expect(page.getByText(`${orderId} 상태를 바꿨습니다.`)).toBeVisible();

  await shop.goto(`${SHOP}/orders`);
  await shop.getByLabel("주문 번호").fill(orderId);
  await shop.getByLabel("받는 분 이름").fill("박데모");
  await shop.getByRole("button", { name: "조회하기" }).click();
  await expect(shop.getByText("배송 중")).toBeVisible();
});

test("상담 신청이 어드민에 쌓인다", async ({ page }) => {
  const shop = await page.context().newPage();
  await shop.goto(`${SHOP}/consult?product=genesis-g80`);
  await shop.getByLabel("이름").fill("최상담");
  await shop.getByLabel("휴대폰 번호").fill("010-4444-5555");
  await shop.getByRole("button", { name: "상담 신청" }).click();
  await expect(shop.getByText("상담 신청을 받았습니다.")).toBeVisible();

  await login(page);
  await page.goto("/consults");
  const row = page.getByRole("row", { name: /최상담/ });
  await expect(row).toContainText("제네시스 G80");
  await page.getByLabel("최상담 상담 상태").selectOption("contacted");
  await page.getByRole("button", { name: /변경\s*:\s*최상담/ }).click();
  await expect(page.getByText("상태를 바꿨습니다.")).toBeVisible();
});

for (const path of ["/", "/products", "/orders", "/consults"]) {
  test(`${path}: axe 위반이 없다`, async ({ page }) => {
    await login(page);
    await page.goto(path);
    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });
}
