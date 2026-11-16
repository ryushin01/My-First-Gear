import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { applyRestockedCount, nextRestockRequest, resetRestockedCount, useRestockedCount } from "./restockNotice";

describe("재입고 알림 수", () => {
  it("가장 최근에 보낸 요청의 결과만 적는다(늦게 온 이전 요청은 버린다)", () => {
    const { result } = renderHook(() => useRestockedCount());
    const first = nextRestockRequest(); // 회원 동기화가 처음 불러온다
    const second = nextRestockRequest(); // 그사이 알림을 마쳐 다시 묻는다
    act(() => applyRestockedCount(second, 0));
    act(() => applyRestockedCount(first, 1)); // 마치기 전에 센 수가 늦게 왔다
    expect(result.current).toBe(0);
  });

  it("먼저 보낸 요청이 먼저 오면 뒤 요청의 결과로 바꾼다", () => {
    const { result } = renderHook(() => useRestockedCount());
    const first = nextRestockRequest();
    const second = nextRestockRequest();
    act(() => applyRestockedCount(first, 2));
    expect(result.current).toBe(2);
    act(() => applyRestockedCount(second, 1));
    expect(result.current).toBe(1);
  });

  it("로그아웃하면 비우고, 그전에 보낸 요청의 결과는 버린다(다른 회원의 수가 남지 않게)", () => {
    const { result } = renderHook(() => useRestockedCount());
    const before = nextRestockRequest();
    act(() => applyRestockedCount(before, 3));
    const late = nextRestockRequest();
    act(() => resetRestockedCount());
    expect(result.current).toBe(0);
    act(() => applyRestockedCount(late, 3));
    expect(result.current).toBe(0);
  });
});
