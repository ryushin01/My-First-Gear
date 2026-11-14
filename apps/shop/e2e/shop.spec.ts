import { expect, test } from "@playwright/test";

test("캐러셀을 키보드로 넘기고 상세를 연다", async ({ page, isMobile }) => {
  test.skip(isMobile, "키보드 조작은 데스크톱에서 검사");
  await page.goto("/");
  const carousel = page.getByRole("region", { name: "추천 기어" });
  const next = carousel.getByRole("button", { name: /다음/ });
  await next.focus();
  await page.keyboard.press("ArrowRight");
  await expect(carousel.getByText("02 / 14")).toBeVisible();
  await page.keyboard.press("ArrowLeft");
  await expect(carousel.getByText("01 / 14")).toBeVisible();
  await carousel.getByRole("link", { name: /재생/ }).click();
  await expect(page).toHaveURL(/\/product\//);
});

test("목록 필터와 정렬이 주소에 남는다", async ({ page }) => {
  await page.goto("/gear/gpu");
  // 필터는 비제어 입력이라 하이드레이션 전에 눌러도 상태가 되돌아가지 않는다.
  await page.getByRole("checkbox", { name: "NVIDIA" }).check();
  await expect(page.getByRole("status").filter({ hasText: "개 상품" })).toHaveText("2개 상품");
  await page.getByLabel("[Sort]").selectOption("price-asc");
  await expect(page).toHaveURL(/brand=NVIDIA/);
  await expect(page).toHaveURL(/sort=price-asc/);
  await page.reload();
  await expect(page.getByRole("checkbox", { name: "NVIDIA" })).toBeChecked();
  const names = await page.locator("main:visible ul li h3").allTextContents();
  expect(names[0]).toContain("RTX 5060");
});

test("장바구니에 담고 모의 결제 후 주문을 조회한다", async ({ page }) => {
  await page.goto("/product/samsung-990-pro-2tb");
  await page.getByRole("button", { name: "장바구니 담기" }).click();
  await expect(page.getByRole("status").filter({ hasText: "담았습니다" })).toBeVisible();
  await expect(page.getByRole("link", { name: /장바구니/ }).first()).toContainText("[1]");

  await page.goto("/cart");
  // 단가는 어드민에서 바뀔 수 있으므로 화면의 단가로 합계를 확인한다.
  const unitText = await page.locator("main:visible li").first().locator(".text-mute-200.font-mono").textContent();
  const unit = Number(unitText!.replace(/[^0-9]/g, ""));
  await page.getByLabel("수량").fill("2");
  await expect(page.getByText(`${(unit * 2).toLocaleString("ko-KR")}원`).first()).toBeVisible();
  await page.getByRole("link", { name: "주문하기" }).click();

  // 빈 칸으로 제출하면 오류 요약에 초점이 간다
  await page.getByRole("button", { name: /결제하기/ }).click();
  await expect(page.locator(".error-summary:visible")).toBeFocused();
  await expect(page.getByLabel("받는 분")).toHaveAttribute("aria-invalid", "true");

  await page.getByLabel("받는 분").fill("김기어");
  await page.getByLabel("휴대폰 번호").fill("010-1234-5678");
  await page.getByLabel("배송 주소").fill("서울시 가상구 데모로 1");
  await page.getByRole("button", { name: /결제하기/ }).click();
  await expect(page.getByText("주문이 접수되었습니다.")).toBeVisible();
  const orderId = (await page.locator("dt:visible:has-text('[Order no.]') + dd").textContent())!.trim();
  expect(orderId).toMatch(/^MFG-\d{6}-\d{6}$/);
  await expect(page.getByRole("link", { name: /장바구니/ }).first()).not.toContainText("[");

  await page.goto("/orders");
  await page.getByLabel("주문 번호").fill(orderId);
  await page.getByLabel("받는 분 이름").fill("김기어");
  await page.getByRole("button", { name: "조회하기" }).click();
  await expect(page.getByText("결제 완료").first()).toBeVisible();
});

test("PC 견적에서 호환성 오류를 알리고 해결하면 담을 수 있다", async ({ page }) => {
  await page.goto("/build");
  const pick = async (slot: string, product: string, hide = true) => {
    await page.getByRole("button", { name: new RegExp(`(고르기|바꾸기)\\s*:\\s*${slot}$`) }).click();
    const dialog = page.getByRole("dialog");
    if (!hide) await dialog.getByLabel("호환 안 되는 상품 숨기기").uncheck();
    await dialog.getByRole("button", { name: new RegExp(product) }).click();
    await expect(dialog).toBeHidden();
  };

  await pick("CPU", "라이젠7 9800X3D");
  await pick("메인보드", "Z890", false); // 소켓이 다른 보드
  await expect(page.getByText(/CPU 소켓\(AM5\)과 메인보드 소켓\(LGA1851\)이 다릅니다/).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "견적 전체 장바구니 담기" })).toBeDisabled();

  await pick("메인보드", "TUF Gaming B650");
  await pick("메모리", "DDR5-5600 32GB");
  await pick("그래픽카드", "RTX 5070 Ti");
  await pick("SSD", "990 PRO");
  await pick("파워", "FOCUS GX-850");
  await pick("케이스", "토크");
  await pick("쿨러", "Peerless Assassin");
  await expect(page.getByText("호환성 확인을 마쳤습니다")).toBeVisible();

  await page.getByRole("button", { name: "견적 전체 장바구니 담기" }).click();
  await page.goto("/cart");
  await expect(page.getByText("조립 서비스 · 기본 조립", { exact: true })).toBeVisible();
  await expect(page.locator("main:visible li")).toHaveCount(9);
});

test("데스크 셋업에서 모니터암·책상 조합을 확인하고 한 번에 담는다", async ({ page }) => {
  await page.goto("/setup");
  const pick = async (slot: string, product: string) => {
    await page.getByRole("button", { name: new RegExp(`(고르기|바꾸기)\\s*:\\s*${slot}$`) }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: new RegExp(product) }).click();
    await expect(dialog).toBeHidden();
  };

  await pick("모니터", "오디세이 OLED G9");
  await pick("모니터암", "펠로우즈");
  await expect(page.getByText(/모니터암은 32인치까지 받칩니다/).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "셋업 전체 장바구니 담기" })).toBeDisabled();

  await page.getByRole("button", { name: /빼기\s*:\s*모니터암$/ }).click();
  await pick("책상", "MAGNUS Pro");
  await pick("스피커", "에디파이어 MR4");
  await expect(page.getByText(/스피커를 놓기 빠듯합니다/).first()).toBeVisible();
  await expect(page.getByText("조합 확인을 마쳤습니다")).toBeVisible();

  await page.getByRole("button", { name: "셋업 전체 장바구니 담기" }).click();
  await page.goto("/cart");
  await expect(page.locator("main:visible li")).toHaveCount(3);
});

test("공유받은 셋업을 열면 고르던 셋업으로 되돌릴 수 있다", async ({ page }) => {
  await page.goto("/setup");
  await page.getByRole("button", { name: /고르기\s*:\s*마우스$/ }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /MX Master 3S/ })
    .click();

  await page.goto(`/setup?s=${encodeURIComponent("chair:p-chair-001")}`);
  await expect(page.getByText("공유받은 셋업을 불러왔습니다")).toBeVisible();
  await expect(page).toHaveURL(/\/setup$/);
  await expect(page.getByText("허먼밀러 뉴 에어론")).toBeVisible();

  await page.getByRole("button", { name: "이전 셋업으로 되돌리기" }).click();
  await expect(page.getByText("로지텍 MX Master 3S")).toBeVisible();
  await expect(page.getByText("허먼밀러 뉴 에어론")).toBeHidden();
});

test("고가 상품은 상담 신청으로 받는다", async ({ page }) => {
  await page.goto("/product/lamborghini-aventador");
  await expect(page.getByRole("button", { name: "장바구니 담기" })).toHaveCount(0);
  await page.getByRole("link", { name: "구매 상담 신청" }).click();
  await expect(page.getByText("상담 상품: 람보르기니 아벤타도르")).toBeVisible();
  await page.getByLabel("이름").fill("김기어");
  await page.getByLabel("휴대폰 번호").fill("01012345678");
  await page.getByRole("button", { name: "상담 신청" }).click();
  await expect(page.getByText("상담 신청을 받았습니다.")).toBeVisible();
});

test("흑백 토글 상태가 유지된다", async ({ page }) => {
  await page.goto("/");
  const toggle = page.getByRole("button", { name: /B&W/ });
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-bw", "on");
});
