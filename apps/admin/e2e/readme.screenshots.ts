import { expect, test, type Page } from "@playwright/test";

/**
 * README 화면 촬영 (pnpm --dir apps/admin screenshots, 먼저 pnpm build). 결과: 저장소 루트의 docs/images/*.jpg
 * 쇼핑몰과 어드민을 같은 임시 DB로 띄워(serve-both) 데모 계정의 주문·견적·문의를 만든 뒤 찍습니다.
 * 회원·주문·문의는 모두 가상 데이터입니다. SCREENSHOTS=1일 때만 프로젝트가 생깁니다.
 */
const SHOP = `http://localhost:${process.env.E2E_SHOP_PORT ?? 3210}`;
const OUT = "../../docs/images";

test.describe.configure({ mode: "serial" });
test.setTimeout(180_000);

async function shoot(page: Page, name: string) {
  await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/${name}.jpg`, type: "jpeg", quality: 82 });
}

async function scrollToSection(page: Page, labelledby: string) {
  await page.locator(`section[aria-labelledby="${labelledby}"]`).evaluate((element) => {
    window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - 24, behavior: "instant" });
  });
  await page.waitForTimeout(800);
}

/** 홈의 조립 연출(고정 화면) 진행도 ratio 위치로 옮깁니다. */
async function assembly(page: Page, ratio: number) {
  await page.goto(SHOP);
  await page.locator('section[aria-labelledby="home-assembly"]').evaluate((element, at) => {
    const top = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + Math.max(0, element.offsetHeight - window.innerHeight) * at, behavior: "instant" });
  }, ratio);
  await page.waitForTimeout(3000);
}

async function loginShop(page: Page) {
  await page.goto(`${SHOP}/login?next=/my`);
  await page.getByRole("textbox", { name: "이메일", exact: true }).fill("demo@myfirstgear.dev");
  await page.getByLabel(/^비밀번호/).fill("demo1234");
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page.getByRole("heading", { name: "김기어님의 채널" })).toBeVisible();
}

async function loginAdmin(page: Page) {
  await page.goto("/login");
  await page.getByLabel("비밀번호").fill("demo-admin");
  await page.getByRole("button", { name: "로그인" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
}

test.describe("쇼핑몰", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("홈·견적·상세·비교·후기", async ({ page }) => {
    await page.goto(SHOP);
    await page.waitForTimeout(2500);
    await shoot(page, "shop-home");
    await scrollToSection(page, "home-monitors");
    await shoot(page, "shop-monitors");

    await page.goto(`${SHOP}/build/quick`);
    await page.getByRole("radio", { name: "200만 원 이하" }).check();
    await page.getByRole("radio", { name: /^게임/ }).check();
    await page.getByRole("button", { name: "추천 받기" }).click();
    await page.getByRole("button", { name: "이 구성으로 PC 견적 시작" }).waitFor();
    await shoot(page, "shop-quick-build");
    await page.getByRole("button", { name: "이 구성으로 PC 견적 시작" }).click();
    await page.waitForURL("**/build**");
    await shoot(page, "shop-build");

    await page.goto(`${SHOP}/product/samsung-odyssey-oled-g9`);
    await shoot(page, "shop-detail");

    for (const slug of ["samsung-odyssey-oled-g9", "samsung-odyssey-oled-g8-g80sd", "samsung-odyssey-neo-g7-43"]) {
      await page.goto(`${SHOP}/product/${slug}`);
      await page.getByRole("button", { name: "비교 담기" }).click();
    }
    await page.getByRole("link", { name: /비교하기 \(3\)/ }).click();
    await page.waitForURL("**/compare**");
    await shoot(page, "shop-compare");

    await assembly(page, 0.9);
    await shoot(page, "shop-assembly");
  });

  test("회원 채널과 상품 후기·질문", async ({ page }) => {
    await loginShop(page);
    // 견적 하나 저장, 주문 하나, 1:1 문의 하나(가상 데이터)
    await page.goto(`${SHOP}/build/quick`);
    await page.getByRole("radio", { name: "200만 원 이하" }).check();
    await page.getByRole("radio", { name: /^게임/ }).check();
    await page.getByRole("button", { name: "추천 받기" }).click();
    await page.getByRole("button", { name: "이 구성으로 PC 견적 시작" }).click();
    await page.waitForURL("**/build**");
    await page.getByLabel("견적 이름").fill("게임용 첫 PC");
    await page.getByRole("button", { name: "견적 저장" }).click();
    await page.waitForTimeout(800);

    await page.goto(`${SHOP}/product/samsung-odyssey-oled-g9`);
    await page.getByRole("button", { name: "장바구니 담기" }).click();
    await page.goto(`${SHOP}/checkout`);
    await page.getByLabel("받는 분").fill("김기어");
    await page.getByLabel("휴대폰 번호").fill("010-1234-5678");
    await page.getByLabel("배송 주소").fill("서울시 가상구 데모로 1");
    await page.getByRole("button", { name: /결제하기/ }).click();
    await page.waitForTimeout(1500);

    await page.goto(`${SHOP}/my#my-inquiries`);
    await page.getByRole("button", { name: "문의 접수" }).click();
    await page.getByLabel(/문의 유형/).selectOption("delivery");
    await page.getByLabel("제목").fill("배송 일정 문의");
    await page.getByLabel("문의 내용").fill("조립 PC는 언제 출고되나요?");
    await page.getByRole("button", { name: "문의 접수" }).click();
    await page.waitForTimeout(800);

    await page.goto(`${SHOP}/my`);
    await shoot(page, "shop-my");

    await page.goto(`${SHOP}/product/antec-torque`);
    await page.getByLabel("후기 내용").fill("케이스가 정말 멋지고 조립 공간도 넉넉해요.");
    await page.getByRole("button", { name: "후기 등록" }).click();
    await page.waitForTimeout(800);
    await page.getByLabel("후기 내용").evaluate((element) => {
      const section = element.closest("section") ?? element;
      window.scrollTo({ top: section.getBoundingClientRect().top + window.scrollY - 120, behavior: "instant" });
    });
    await shoot(page, "shop-community");
  });
});

test.describe("모바일 쇼핑몰", () => {
  test.use({ viewport: { width: 360, height: 780 } });

  test("홈과 조립", async ({ page }) => {
    await page.goto(SHOP);
    await page.waitForTimeout(2500);
    await shoot(page, "mobile-home");
    await page.setViewportSize({ width: 390, height: 844 });
    await assembly(page, 0.9);
    await shoot(page, "mobile-assembly");
  });
});

test.describe("어드민", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("대시보드·상품·문의", async ({ page }) => {
    await loginAdmin(page);
    await page.goto("/");
    await shoot(page, "admin-dashboard");
    await page.goto("/products?category=gpu");
    await shoot(page, "admin-products");
    await page.goto("/inquiries");
    await shoot(page, "admin-inquiries");
  });
});
