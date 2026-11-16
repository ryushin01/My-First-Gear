import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { refreshRestockedCount } from "./refreshRestocked";
import { useRestockedCount } from "./restockNotice";

const { getRestockedCountAction } = vi.hoisted(() => ({ getRestockedCountAction: vi.fn() }));
vi.mock("../api/actions", () => ({ getRestockedCountAction }));

describe("재입고 알림 수 다시 받기", () => {
  it("서버가 센 수로 바꾸고, 받지 못하면 그대로 둔다", async () => {
    const { result } = renderHook(() => useRestockedCount());
    getRestockedCountAction.mockResolvedValueOnce(2);
    await act(() => refreshRestockedCount());
    expect(result.current).toBe(2);
    getRestockedCountAction.mockRejectedValueOnce(new Error("offline"));
    await act(() => refreshRestockedCount());
    expect(result.current).toBe(2);
    getRestockedCountAction.mockResolvedValueOnce(null); // 로그인하지 않음
    await act(() => refreshRestockedCount());
    expect(result.current).toBe(2);
  });
});
