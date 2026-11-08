import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ErrorSummary, TextField } from "./Field";

describe("TextField", () => {
  it("레이블, 도움말, 오류를 입력 칸과 연결한다", () => {
    render(<TextField id="email" label="이메일" hint="주문 안내용" error="형식이 아닙니다" required />);
    const input = screen.getByRole("textbox", { name: "이메일" });
    expect(input).toHaveAttribute("name", "email");
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("주문 안내용 형식이 아닙니다");
  });

  it("같은 이름의 칸이 두 개 있어도 id가 겹치지 않는다 (숨겨 둔 이전 화면 대비)", () => {
    render(
      <>
        <TextField id="email" label="첫 번째" />
        <TextField id="email" label="두 번째" />
      </>,
    );
    const [a, b] = screen.getAllByRole("textbox");
    expect(a.id).not.toBe(b.id);
    expect(screen.getByLabelText(/^두 번째/)).toBe(b);
  });
});

describe("ErrorSummary", () => {
  it("오류 링크를 누르면 같은 폼의 칸으로 초점이 간다", async () => {
    render(
      <form>
        <ErrorSummary titleId="t" errors={{ phone: "휴대폰 번호를 입력해 주세요." }} />
        <TextField id="phone" label="휴대폰 번호" />
      </form>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("입력 내용을 확인해 주세요. (1건)");
    await userEvent.click(screen.getByRole("link", { name: "휴대폰 번호를 입력해 주세요." }));
    expect(screen.getByRole("textbox", { name: /^휴대폰 번호/ })).toHaveFocus();
  });
});
