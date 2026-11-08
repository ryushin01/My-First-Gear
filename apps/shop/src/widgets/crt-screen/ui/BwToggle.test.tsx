import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { BwToggle } from "./BwToggle";

describe("BwToggle", () => {
  it("누르면 aria-pressed와 흑백 모드가 바뀌고 저장된다", async () => {
    render(<BwToggle />);
    const button = screen.getByRole("button", { name: "B&W" });
    expect(button).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(button);
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.dataset.bw).toBe("on");
    expect(window.localStorage.getItem("mfg:bw")).toBe("on");
  });
});
