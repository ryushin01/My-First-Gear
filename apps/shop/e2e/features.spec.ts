import { expect, test, type Page } from "@playwright/test";

async function signup(page: Page) {
  const email = `f-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
  await page.goto("/signup?next=/my");
  await page.getByRole("textbox", { name: "이름", exact: true }).fill("기능회원");
  await page.getByRole("textbox", { name: "이메일", exact: true }).fill(email);
  await page.getByLabel(/^비밀번호/).fill("password1");
  await page.getByLabel(/개인정보/).check();
  await page.getByRole("button", { name: "가입하기" }).click();
  await expect(page.getByRole("heading", { name: "기능회원님의 채널" })).toBeVisible();
  return email;
}

test("검색: 낱말이 모두 들어간 상품을 찾고 최근 검색어를 남긴다", async ({ page }) => {
  await page.goto("/search");
  await page.getByRole("searchbox", { name: "검색어" }).fill("AM5 메인보드");
  await page.getByRole("button", { name: "검색", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "검색 결과" })).toHaveText('"AM5 메인보드" 검색 결과 2개');
  await expect(page.getByRole("link", { name: "AM5 메인보드" })).toBeVisible(); // 최근 검색어
});

test("빠른 견적: 예산과 용도로 추천받아 PC 견적으로 가져간다", async ({ page }) => {
  await page.goto("/build/quick");
  await page.getByRole("radio", { name: "200만 원 이하" }).check();
  await page.getByRole("radio", { name: /^게임/ }).check();
  await page.getByRole("button", { name: "추천 받기" }).click();
  await expect(page.getByText(/게임용 · /)).toBeVisible();
  await page.getByRole("button", { name: "이 구성으로 PC 견적 시작" }).click();
  await expect(page).toHaveURL(/\/build$/);
  await expect(page.getByText("호환성 확인을 마쳤습니다.")).toBeVisible();
});

test("비교와 최근 본 상품", async ({ page }) => {
  await page.goto("/product/sennheiser-hd-600");
  await page.getByRole("button", { name: "비교 담기" }).click();
  await page.goto("/product/sony-wh-1000xm6");
  await page.getByRole("button", { name: "비교 담기" }).click();
  await expect(page.getByRole("button", { name: "비교 담기" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("link", { name: /비교하기 \(2\)/ }).click();
  const table = page.getByRole("table");
  await expect(table.getByRole("columnheader", { name: /젠하이저 HD 600/ })).toBeVisible();
  await expect(table.getByRole("rowheader", { name: "임피던스" })).toBeVisible();
  await page.goto("/");
  await expect(page.getByRole("region", { name: "최근 본 상품" }).getByRole("link", { name: "소니 WH-1000XM6" })).toBeVisible();
});

test("장바구니에 담긴 PC 부품끼리 호환성을 다시 알려 준다", async ({ page }) => {
  for (const slug of ["amd-ryzen-7-9800x3d", "asrock-z890-pro-rs"]) {
    await page.goto(`/product/${slug}`);
    await page.getByRole("button", { name: "장바구니 담기" }).click();
    await expect(page.getByRole("status").filter({ hasText: "담았습니다" })).toBeVisible();
  }
  await page.goto("/cart");
  await expect(page.getByRole("region", { name: "PC 부품 호환성" })).toContainText("소켓");
});

test("회원 장바구니는 다른 기기에서도 이어진다", async ({ page, browser }) => {
  const email = await signup(page);
  await page.goto("/product/samsung-990-pro-2tb");
  await page.getByRole("button", { name: "장바구니 담기" }).click();
  await page.waitForTimeout(1500); // 저장 대기(0.8초 디바운스)

  const other = await (await browser.newContext()).newPage();
  await other.goto("/login");
  await other.getByRole("textbox", { name: "이메일", exact: true }).fill(email);
  await other.getByLabel(/^비밀번호/).fill("password1");
  await other.getByRole("button", { name: "로그인" }).click();
  await other.waitForURL("**/my");
  await other.goto("/cart");
  await expect(other.getByRole("link", { name: "삼성전자 990 PRO 2TB" })).toBeVisible();
});

test("주문 취소와 배송 단계, 재입고 알림", async ({ page }) => {
  await signup(page);
  await page.goto("/product/wd-black-sn850x-1tb");
  await page.getByRole("button", { name: "장바구니 담기" }).click();
  await page.goto("/checkout");
  await page.getByLabel("받는 분").fill("기능회원");
  await page.getByLabel("휴대폰 번호").fill("010-1234-5678");
  await page.getByLabel("배송 주소").fill("서울시 가상구 데모로 1");
  await page.getByRole("button", { name: /결제하기/ }).click();
  await expect(page.getByText("주문이 접수되었습니다.")).toBeVisible();

  await page.goto("/my");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: /주문 취소/ }).click();
  await expect(page.getByText(/주문을 취소했습니다/)).toBeVisible();
  await page.reload();
  await page.getByText("주문 취소", { exact: true }).first().click(); // details 펼치기
  await expect(page.getByRole("listitem").filter({ hasText: "결제 완료" }).first()).toBeVisible();

  await page.goto("/product/nintendo-switch-2");
  await page.getByRole("button", { name: "재입고 알림 신청" }).click();
  await expect(page.getByRole("button", { name: "재입고 알림 신청됨" })).toHaveAttribute("aria-pressed", "true");
  await page.goto("/my#my-restock");
  await expect(page.getByRole("region", { name: "재입고 알림" })).toContainText("닌텐도 스위치 2");
});

test("로그인 시도 제한과 로그아웃 뒤 세션 무효화", async ({ page, context }) => {
  const email = await signup(page);
  const cookie = (await context.cookies()).find((c) => c.name === "mfg_session")!;
  await page.getByRole("button", { name: "로그아웃" }).click();
  await page.waitForURL(/\/$/);
  await context.addCookies([cookie]); // 로그아웃 전 쿠키를 다시 넣어도
  await page.goto("/my");
  await expect(page).toHaveURL(/\/login/); // 세션이 지워져 들어갈 수 없다

  for (let i = 0; i < 5; i++) {
    await expect(page.getByRole("button", { name: "로그인" })).toBeEnabled(); // 이전 제출이 끝나 폼이 비워진 뒤 입력한다
    await page.getByRole("textbox", { name: "이메일", exact: true }).fill(email);
    await page.getByLabel(/^비밀번호/).fill("wrong-password");
    await page.getByRole("button", { name: "로그인" }).click();
    await expect(page.getByRole("alert").filter({ hasText: /맞지 않습니다|막았습니다/ })).toBeVisible();
  }
  await expect(page.getByRole("button", { name: "로그인" })).toBeEnabled();
  await page.getByLabel(/^비밀번호/).fill("password1");
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "막았습니다" })).toBeVisible(); // 맞는 비밀번호도 잠시 막는다
});

test("검색 엔진·공유: sitemap, robots, 구조화 데이터, OG 이미지", async ({ page, request }) => {
  expect((await request.get("/robots.txt")).status()).toBe(200);
  expect(await (await request.get("/sitemap.xml")).text()).toContain("/product/antec-torque");
  for (const path of ["/opengraph-image", "/product/antec-torque/opengraph-image", "/api/og/build?b=cpu:p-cpu-001%7C"]) {
    const res = await request.get(path);
    expect(res.status(), path).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
  }
  await page.goto("/product/antec-torque");
  const jsonLd = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
  expect(jsonLd).toMatchObject({ "@type": "Product", name: "안텍 토크", offers: { priceCurrency: "KRW" } });
});

test("성능 예산: 홈 글꼴 700KB 이하, 홈에는 추천 상품만 싣는다", async ({ page }) => {
  let fontBytes = 0;
  page.on("response", async (res) => {
    if (res.request().resourceType() === "font") fontBytes += (await res.body().catch(() => Buffer.alloc(0))).length;
  });
  const html = await (await page.request.get("/")).text();
  await page.goto("/", { waitUntil: "networkidle" });
  expect(fontBytes).toBeLessThan(700 * 1024);
  expect(new Set(html.match(/p-[a-z]+-0\d\d/g)).size).toBeLessThanOrEqual(15);
});
