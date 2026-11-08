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
  // 실패해도 입력한 값은 그대로 남는다
  await expect(page.getByLabel("WD BLACK SN850X 1TB 정가")).toHaveValue("1000");

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
  const orderId = (await shop.locator("dt:visible:has-text('[Order no.]') + dd").textContent())!.trim();

  await login(page);
  await page.goto("/");
  await expect(page.getByRole("link", { name: orderId })).toBeVisible();
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
  const name = `최상담${Date.now() % 100000}`;
  const shop = await page.context().newPage();
  await shop.goto(`${SHOP}/consult?product=genesis-g80`);
  await shop.getByLabel("이름").fill(name);
  await shop.getByLabel("휴대폰 번호").fill("010-4444-5555");
  await shop.getByRole("button", { name: "상담 신청" }).click();
  await expect(shop.getByText("상담 신청을 받았습니다.")).toBeVisible();

  await login(page);
  await page.goto("/consults");
  const row = page.getByRole("row", { name: new RegExp(name) });
  await expect(row).toContainText("제네시스 G80");
  await page.getByLabel(`${name} 상담 상태`).selectOption("contacted");
  await page.getByRole("button", { name: new RegExp(`변경\\s*:\\s*${name}`) }).click();
  await expect(page.getByText("상태를 바꿨습니다.")).toBeVisible();
});

test("문의에 답하면 회원 마이페이지와 상품 Q&A에 보인다", async ({ page }) => {
  const title = `A/S 접수 방법 ${Date.now() % 100000}`;
  const reply = `사진과 함께 다시 남겨 주세요 ${Date.now() % 100000}`;
  const shop = await page.context().newPage();
  await shop.goto(`${SHOP}/login`);
  await shop.getByRole("textbox", { name: "이메일", exact: true }).fill("demo@myfirstgear.dev");
  await shop.getByLabel(/^비밀번호/).fill("demo1234");
  await shop.getByRole("button", { name: "로그인" }).click();
  await expect(shop.getByRole("heading", { name: "김기어님의 채널" })).toBeVisible();
  await shop.getByLabel(/문의 유형/).selectOption("as");
  await shop.getByLabel("제목").fill(title);
  await shop.getByLabel("문의 내용").fill("팬 소음이 있어요. 어떻게 접수하나요?");
  await shop.getByRole("button", { name: "문의 접수" }).click();
  await expect(shop.getByText("문의를 접수했습니다.")).toBeVisible();

  await login(page);
  await page.goto("/inquiries");
  await page.getByLabel(`“${title}” 답변`).fill(reply);
  await page.getByLabel(`“${title}” 답변`).locator("xpath=ancestor::form").getByRole("button").click();
  await expect(page.getByText("답변을 등록했습니다.").first()).toBeVisible();

  // 시드 질문(RTX 5070 Ti 파워)에 답변
  const seedAnswer = page.getByLabel("이데모님 질문 답변");
  await seedAnswer.fill("750W GOLD 등급이면 충분합니다.");
  await seedAnswer.locator("xpath=ancestor::form").getByRole("button").click(); // 두 번째 실행에서는 "답변 고치기"
  await expect(page.getByText(/쇼핑몰 상품 페이지에 반영됩니다/)).toBeVisible();

  await shop.reload(); // 같은 주소라 다시 불러와 답변을 확인한다
  await expect(shop.getByText(reply).filter({ visible: true }).first()).toBeVisible();
  await expect(async () => {
    await shop.goto(`${SHOP}/product/geforce-rtx-5070-ti-16gb`);
    await expect(shop.getByText("750W GOLD 등급이면 충분합니다.")).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 15_000 });

  await page.goto("/members");
  await expect(page.getByRole("rowheader", { name: "김기어" })).toBeVisible();
});

for (const path of ["/", "/products", "/orders", "/consults", "/inquiries", "/members"]) {
  test(`${path}: 가로 넘침과 axe 위반이 없다`, async ({ page }) => {
    await login(page);
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });
}
