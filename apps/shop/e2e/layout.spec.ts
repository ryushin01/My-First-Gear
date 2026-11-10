import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const pages = ["/", "/gear", "/gear/gpu", "/gear/monitor", "/product/antec-torque", "/product/samsung-odyssey-oled-g9", "/gear/camping", "/product/nordisk-asgard-12-6", "/build", "/assembly", "/cart", "/checkout", "/orders", "/consult", "/login", "/signup", "/my", "/search?q=AM5", "/build/quick", "/compare"];

for (const path of pages) {
  test(`${path}: 가로 넘침, 작은 조작 요소, axe 위반이 없다`, async ({ page }) => {
    await page.goto(path);
    // 로그인이 필요한 화면은 로그인 화면으로 이동이 끝난 뒤 검사한다.
    if (path === "/my") await page.waitForURL(/\/login\?next=/);
    await expect(page.getByRole("main")).toBeVisible();
    // 스트리밍으로 들어오는 본문까지 그려진 뒤 검사한다 (페이지 제목이 나타날 때까지 기다림)
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    // 조작 가능한 요소는 24×24px 이상 (KWCAG 6.1.3). 문단 안 링크, 레이블 안 체크박스, inert 영역, 숨은 바로가기는 뺀다.
    const small = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>("a, button, select, input:not([type=checkbox]):not([type=radio]):not([type=hidden]), textarea")]
        .filter((el) => el.checkVisibility() && !el.closest("p, [inert], .sr-only") && !el.matches(".sr-only"))
        .filter((el) => !el.matches("article a")) // 상품 카드는 카드 전체가 링크 영역
        .map((el) => ({ name: (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 30), box: el.getBoundingClientRect() }))
        .filter(({ box }) => box.width < 24 || box.height < 24)
        .map(({ name, box }) => `${name} ${Math.round(box.width)}x${Math.round(box.height)}`),
    );
    expect(small).toEqual([]);
    const { violations } = await new AxeBuilder({ page }).exclude(".crt-overlay").analyze();
    expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });
}

test("문서 언어와 제목, 본문 바로가기", async ({ page }) => {
  await page.goto("/gear/cpu");
  await expect(page.locator("html")).toHaveAttribute("lang", "ko");
  await expect(page).toHaveTitle("CPU · My First Gear");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "본문 바로가기" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
});

test("다른 화면을 다녀와도 id가 겹치지 않는다", async ({ page, isMobile }) => {
  test.skip(isMobile, "DOM 검사라 화면 크기와 무관하다");
  // Cache Components는 이전 화면을 숨긴 채 DOM에 남긴다.
  await page.goto("/login");
  await page.getByRole("link", { name: "회원 가입" }).click();
  await expect(page.getByRole("heading", { name: "회원 가입" })).toBeVisible();
  await page.getByRole("link", { name: "Gear", exact: true }).click();
  await page.getByRole("link", { name: "그래픽카드" }).first().click();
  await expect(page.getByRole("heading", { level: 1, name: "그래픽카드" })).toBeVisible();
  await page.getByRole("link", { name: /RTX 5060/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: /RTX 5060/ })).toBeVisible();
  const duplicates = await page.evaluate(() => {
    const ids = [...document.querySelectorAll("[id]")].map((el) => el.id);
    return ids.filter((id, i) => ids.indexOf(id) !== i);
  });
  expect(duplicates).toEqual([]);
});
