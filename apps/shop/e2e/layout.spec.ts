import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const pages = ["/", "/gear", "/gear/gpu", "/product/antec-torque", "/build", "/assembly", "/cart", "/checkout", "/orders", "/consult"];

for (const path of pages) {
  test(`${path}: 가로 넘침이 없고 axe 위반이 없다`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator("main#main")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
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
});
