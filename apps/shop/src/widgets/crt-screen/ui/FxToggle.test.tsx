import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FxToggle } from "./FxToggle";
import { Timecode } from "./Timecode";

describe("FxToggle", () => {
  it("효과를 끄면 타임코드가 멈추고 상태가 저장된다", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(
      <>
        <FxToggle />
        <span data-testid="tc">
          <Timecode />
        </span>
      </>,
    );
    const button = screen.getByRole("button", { name: "효과" });
    expect(button).toHaveAttribute("aria-pressed", "true");
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByTestId("tc")).toHaveTextContent("00:00:02");

    await userEvent.click(button);
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(document.documentElement.dataset.fx).toBe("off");
    expect(window.localStorage.getItem("mfg:fx")).toBe("off");
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByTestId("tc")).toHaveTextContent("00:00:02");
    vi.useRealTimers();
  });
});
