import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { addToCart, readCart } from "@/entities/cart";
import { LogoutButton } from "./AuthForms";

const { logoutAction, flushMemberSaves } = vi.hoisted(() => ({ logoutAction: vi.fn(), flushMemberSaves: vi.fn() }));
vi.mock("../api/actions", () => ({ loginAction: vi.fn(), signupAction: vi.fn(), logoutAction }));
vi.mock("@/entities/member", async (importOriginal) => ({ ...(await importOriginal<object>()), flushMemberSaves }));

describe("LogoutButton", () => {
  it("남은 장바구니·견적을 저장하지 못하면 로그아웃하지 않고 이 기기의 값을 그대로 둔다", async () => {
    flushMemberSaves.mockResolvedValue(false);
    addToCart("p-ssd-001");
    render(<LogoutButton />);
    await userEvent.click(screen.getByRole("button", { name: "로그아웃" }));
    expect(await screen.findByRole("status")).toHaveTextContent("저장하지 못해 로그아웃하지 않았습니다");
    expect(logoutAction).not.toHaveBeenCalled();
    expect(readCart()).toEqual([{ productId: "p-ssd-001", quantity: 1 }]);
  });
});
