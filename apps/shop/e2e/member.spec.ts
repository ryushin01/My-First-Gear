import { expect, test, type Page } from "@playwright/test";

async function signup(page: Page) {
  const email = `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
  await page.goto("/signup?next=/my");
  // 빈 칸으로 제출하면 오류 요약을 보여 준다
  await page.getByRole("button", { name: "가입하기" }).click();
  await expect(page.locator(".error-summary:visible")).toBeFocused();
  await page.getByRole("textbox", { name: "이름", exact: true }).fill("테스트회원");
  await page.getByRole("textbox", { name: "이메일", exact: true }).fill(email);
  await page.getByLabel(/^비밀번호/).fill("password1");
  await page.getByLabel(/개인정보/).check();
  await page.getByRole("button", { name: "가입하기" }).click();
  await expect(page.getByRole("heading", { name: "테스트회원님의 채널" })).toBeVisible();
  return email;
}

test("데모 계정으로 로그인하고 로그아웃한다", async ({ page }) => {
  await page.goto("/my");
  await expect(page).toHaveURL(/\/login\?next=(%2F|\/)my/);
  await page.getByRole("textbox", { name: "이메일", exact: true }).fill("demo@myfirstgear.dev");
  await page.getByLabel(/^비밀번호/).fill("틀림");
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "맞지 않습니다" })).toBeVisible();
  // 실패해도 입력한 이메일은 그대로 남는다 (KWCAG 7.3.4)
  await expect(page.getByRole("textbox", { name: "이메일", exact: true })).toHaveValue("demo@myfirstgear.dev");
  await page.getByLabel(/^비밀번호/).fill("demo1234");
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page.getByRole("heading", { name: "김기어님의 채널" })).toBeVisible();
  await expect(page.getByRole("link", { name: /페이지 \(김기어님\)/ })).toBeVisible();
  await page.getByRole("button", { name: "로그아웃" }).click();
  await expect(page.getByRole("link", { name: "로그인" })).toBeVisible();
});

test("회원은 후기와 질문을 남기고 찜한다", async ({ page }) => {
  await signup(page);
  await page.goto("/product/wd-black-sn850x-1tb");
  await page.getByRole("radio", { name: "4점" }).check();
  await page.getByLabel("후기 내용").fill("부팅이 빨라졌어요. 만족합니다.");
  await page.getByRole("button", { name: "후기 등록" }).click();
  await expect(page.getByText("후기를 등록했습니다.")).toBeVisible();
  await expect(page.getByText("부팅이 빨라졌어요. 만족합니다.").filter({ visible: true }).first()).toBeVisible();
  await expect(page.getByText("테***").first()).toBeVisible();

  await page.getByLabel("상품 질문").fill("방열판이 함께 오나요?");
  await page.getByRole("button", { name: "질문 등록" }).click();
  await expect(page.getByText("방열판이 함께 오나요?")).toBeVisible();

  const wish = page.getByRole("button", { name: "찜하기" });
  await expect(wish).toBeEnabled();
  await wish.click();
  await expect(wish).toHaveAttribute("aria-pressed", "true");
  await page.goto("/my#my-wish");
  await expect(page.getByRole("link", { name: "WD BLACK SN850X 1TB" })).toBeVisible();
});

test("회원 주문, 견적 저장, 1:1 문의가 마이페이지에 모인다", async ({ page }) => {
  await signup(page);
  await page.goto("/build");
  await page.getByRole("button", { name: /고르기\s*:\s*CPU$/ }).click();
  await page.getByRole("dialog").getByRole("button", { name: /9600X/ }).click();
  await page.getByLabel("견적 이름").fill("사무용 견적");
  await page.getByRole("button", { name: "견적 저장" }).click();
  await expect(page.getByText(/"사무용 견적" 견적을 마이페이지에 저장했습니다/)).toBeVisible();

  await page.goto("/product/samsung-ddr5-5600-32gb-kit");
  await page.getByRole("button", { name: "장바구니 담기" }).click();
  await page.goto("/checkout");
  await page.getByLabel("받는 분").fill("테스트회원");
  await page.getByLabel("휴대폰 번호").fill("010-1234-5678");
  await page.getByLabel("배송 주소").fill("서울시 가상구 데모로 1");
  await page.getByRole("button", { name: /결제하기/ }).click();
  const orderId = (await page.locator("dt:visible:has-text('[Order no.]') + dd").textContent())!.trim();

  await page.goto("/my");
  await expect(page.getByRole("rowheader", { name: orderId })).toBeVisible();
  await expect(page.getByText("사무용 견적", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: /불러오기\s*:\s*사무용 견적/ }).click();
  await expect(page.getByText("AMD 라이젠5 9600X")).toBeVisible();

  await page.goto("/my#my-inquiries");
  await page.getByRole("button", { name: "문의 접수" }).click();
  await expect(page.locator(".error-summary:visible")).toBeFocused();
  await page.getByLabel(/문의 유형/).selectOption("delivery");
  await page.getByLabel("제목").fill("배송 일정 문의");
  await page.getByLabel("문의 내용").fill("조립 PC는 언제 출고되나요?");
  await page.getByRole("button", { name: "문의 접수" }).click();
  await expect(page.getByText("문의를 접수했습니다.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "배송 일정 문의" })).toBeVisible();
});

test("로그인하지 않으면 후기·질문 대신 로그인 안내를 보여 준다", async ({ page }) => {
  await page.goto("/product/antec-torque");
  await expect(page.getByText("부품이 다 보여서 책상 위 오브제가 됐습니다.")).toBeVisible();
  await expect(page.getByText(/330mm까지 장착할 수 있어/)).toBeVisible();
  await expect(page.getByRole("button", { name: "후기 등록" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "로그인" }).nth(1)).toBeVisible();
});

test("결제와 질문 등록을 빠르게 두 번 눌러도 한 번만 저장된다", async ({ page }) => {
  await signup(page);
  await page.goto("/product/samsung-990-pro-2tb");
  await page.getByRole("button", { name: "장바구니 담기" }).click();
  await page.goto("/checkout");
  await page.getByLabel("받는 분").fill("테스트회원");
  await page.getByLabel("휴대폰 번호").fill("010-1234-5678");
  await page.getByLabel("배송 주소").fill("서울시 가상구 데모로 1");
  await page.getByRole("button", { name: /결제하기/ }).dblclick();
  await expect(page.getByText("주문이 접수되었습니다.")).toBeVisible();
  await page.goto("/my");
  await expect(page.getByRole("table", { name: "회원 주문 내역" }).getByRole("rowheader")).toHaveCount(1);

  const question = `중복 확인 ${Date.now()}`;
  await page.goto("/product/samsung-990-pro-2tb");
  await page.getByLabel("상품 질문").fill(question);
  await page.getByRole("button", { name: "질문 등록" }).dblclick();
  await expect(page.getByText("질문을 등록했습니다.", { exact: false })).toBeVisible();
  await page.reload();
  await expect(page.getByText(question, { exact: true })).toHaveCount(1);
});
