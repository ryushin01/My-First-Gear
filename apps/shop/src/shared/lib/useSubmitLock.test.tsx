import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useSubmitLock } from "./useSubmitLock";

function Form({ onSave }: { onSave: () => Promise<void> }) {
  const lock = useSubmitLock();
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        if (!lock.tryLock()) return;
        await onSave();
        lock.release();
      }}
    >
      <button type="submit">저장</button>
    </form>
  );
}

describe("useSubmitLock", () => {
  it("저장이 끝나기 전 연속 클릭은 한 번만 보낸다", async () => {
    let finish!: () => void;
    const onSave = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    render(<Form onSave={onSave} />);
    const button = screen.getByRole("button", { name: "저장" });
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);
    expect(onSave).toHaveBeenCalledTimes(1);
    finish();
    await Promise.resolve();
    await Promise.resolve();
    fireEvent.click(button);
    expect(onSave).toHaveBeenCalledTimes(2);
  });
});
