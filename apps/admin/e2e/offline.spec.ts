import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * 인터넷 없이(localhost 밖 요청을 모두 막고) 로컬 DB(PGlite)로 띄운 쇼핑몰·어드민이 내용과 함께 뜨는지 봅니다.
 * 상품 그림(SVG)·글꼴·카탈로그는 저장소 안에 있고, 주문·회원·상담은 로컬 DB의 시드 데이터를 씁니다.
 */
const SHOP = `http://localhost:${process.env.E2E_SHOP_PORT ?? 3210}`;

test.beforeEach(async ({ context }) => {
  await context.route(
    (url) => url.hostname !== "localhost" && url.hostname !== "127.0.0.1",
    (route) => route.abort("internetdisconnected"),
  );
});

function watch(page: Page) {
  const errors: string[] = [];
  const failed: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("requestfailed", (req) => {
    // 화면이 미리 받기를 그만둔 요청(ERR_ABORTED)은 실패로 보지 않습니다.
    if (new URL(req.url()).hostname === "localhost" && req.failure()?.errorText !== "net::ERR_ABORTED") failed.push(req.url());
  });
  return { errors, failed };
}

async function expectAccessible(page: Page) {
  const { violations } = await new AxeBuilder({ page }).exclude(".crt-overlay").analyze();
  expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
}

const shopPages = [
  { path: "/", text: /My First Gear|기어/ },
  { path: "/gear/gpu", text: /원/ },
  { path: "/product/samsung-990-pro-2tb", text: /990 PRO/ },
  { path: "/build", text: /견적/ },
  { path: "/search", text: /검색/ },
];

for (const { path, text } of shopPages) {
  test(`쇼핑몰 ${path}: 인터넷 없이도 내용이 보이고 axe 위반이 없다`, async ({ page }) => {
    const { errors, failed } = watch(page);
    await page.goto(`${SHOP}${path}`);
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator("main")).toContainText(text);
    await expectAccessible(page);
    expect(failed, "사이트 안 요청 실패").toEqual([]);
    expect(errors, "런타임 오류").toEqual([]);
  });
}

test("쇼핑몰: 인터넷 없이도 로컬 DB로 주문까지 된다", async ({ page }) => {
  await page.goto(`${SHOP}/product/samsung-ddr5-5600-32gb-kit`);
  await page.getByRole("button", { name: "장바구니 담기" }).click();
  await page.goto(`${SHOP}/checkout`);
  await expect(page.getByLabel("받는 분")).toBeVisible();
  await expect(page.getByText("서버에 연결할 수 없습니다")).toHaveCount(0);
});

test("어드민 로그인: 인터넷 없이도 데모 비밀번호 안내가 보이고 axe 위반이 없다", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByLabel("비밀번호")).toBeVisible();
  await expectAccessible(page);
});

// 새 로컬 DB에는 주문이 없어 주문 화면은 빈 안내를 보여 줍니다(표는 상품·회원 화면에서 봅니다).
for (const path of ["/products", "/orders", "/members"]) {
  test(`어드민 ${path}: 인터넷 없이도 데모 비밀번호로 들어가 로컬 DB 내용을 본다`, async ({ page }) => {
    // 상품 표가 길어 axe 검사가 오래 걸립니다.
    test.setTimeout(120_000);
    const { errors, failed } = watch(page);
    await page.goto(path);
    await expect(page).toHaveURL(/\/login/);
    await page.getByLabel("비밀번호").fill("demo-admin");
    await page.getByRole("button", { name: "로그인" }).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator("main")).not.toBeEmpty();
    if (path !== "/orders") await expect(page.locator("table").first()).toBeVisible();
    await expect(page.getByText("서버에 연결할 수 없습니다")).toHaveCount(0);
    await expectAccessible(page);
    expect(failed, "사이트 안 요청 실패").toEqual([]);
    expect(errors, "런타임 오류").toEqual([]);
  });
}
