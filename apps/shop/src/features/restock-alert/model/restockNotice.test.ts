import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { decreaseRestockedCount, setRestockedCount, startRestockLoad, useRestockedCount } from "./restockNotice";

describe("재입고 알림 수", () => {
  afterEach(() => act(() => setRestockedCount(null, 0)));

  it("다른 회원으로 바뀐 뒤 도착한 이전 회원의 알림 마침은 무시한다", () => {
    const { result } = renderHook(() => useRestockedCount());
    act(() => {
      startRestockLoad("A");
      setRestockedCount("A", 2);
      startRestockLoad("B");
      setRestockedCount("B", 1);
      decreaseRestockedCount("A");
    });
    expect(result.current).toBe(1);
  });

  it("불러오는 사이 마친 알림은 불러온 수에서 뺀다", () => {
    const { result } = renderHook(() => useRestockedCount());
    act(() => {
      startRestockLoad("A");
      decreaseRestockedCount("A"); // 응답이 오기 전에 마쳤다
      setRestockedCount("A", 1); // 마치기 전에 센 수
    });
    expect(result.current).toBe(0);
  });

  it("이전 회원의 불러온 수는 버리고, 로그아웃하면 비운다", () => {
    const { result } = renderHook(() => useRestockedCount());
    act(() => {
      startRestockLoad("B");
      setRestockedCount("A", 3);
    });
    expect(result.current).toBe(0);
    act(() => setRestockedCount("B", 2));
    expect(result.current).toBe(2);
    act(() => setRestockedCount(null, 0));
    expect(result.current).toBe(0);
  });
});
