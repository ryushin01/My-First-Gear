import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const actions = vi.hoisted(() => ({
  loadMemberStateAction: vi.fn(),
  checkMemberSessionAction: vi.fn(),
  saveMemberCartAction: vi.fn(),
  saveMemberBuildAction: vi.fn(),
}));
vi.mock("../api/memberSync", () => actions);

// 동기화 상태(불러온 회원, 마지막 확인 시각)가 모듈에 남으므로 테스트마다 새로 불러온다.
async function load() {
  vi.resetModules();
  const [{ MemberSync }, member, cart] = await Promise.all([import("./MemberSync"), import("@/entities/member"), import("@/entities/cart")]);
  return { MemberSync, ...member, ...cart };
}

describe("MemberSync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    document.cookie = "mfg_member=member; path=/";
    actions.loadMemberStateAction.mockResolvedValue({ cart: [], build: null });
    actions.checkMemberSessionAction.mockResolvedValue("ok");
    actions.saveMemberCartAction.mockResolvedValue("saved");
    actions.saveMemberBuildAction.mockResolvedValue("saved");
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("이미 불러온 회원이어도 화면을 옮기면 1분에 한 번 서버 세션을 확인하고, 끝났으면 이 기기의 회원 장바구니를 지운다", async () => {
    const { MemberSync, flushMemberSaves, addToCart, readCart } = await load();
    render(<MemberSync />);
    // 로그아웃 전 동기화는 불러오는 중인 요청을 함께 기다렸다가 바로 저장한다(0.8초를 기다리지 않음)
    await expect(flushMemberSaves()).resolves.toBe(true);
    expect(actions.loadMemberStateAction).toHaveBeenCalledTimes(1);
    expect(actions.saveMemberCartAction).toHaveBeenCalledTimes(1);
    addToCart("p-ssd-001");
    cleanup();

    // 1분 안에 다른 화면으로 옮기면 다시 확인하지 않는다
    render(<MemberSync />);
    cleanup();
    expect(actions.checkMemberSessionAction).not.toHaveBeenCalled();

    // 1분이 지나 옮기면 불러오기는 건너뛰되 세션은 확인한다
    vi.spyOn(Date, "now").mockReturnValue(Date.now() + 61_000);
    actions.checkMemberSessionAction.mockResolvedValue("signed-out");
    const changed = vi.fn();
    window.addEventListener("mfg:member", changed);
    render(<MemberSync />);
    await vi.waitFor(() => expect(changed).toHaveBeenCalled());
    window.removeEventListener("mfg:member", changed);
    expect(actions.checkMemberSessionAction).toHaveBeenCalledTimes(1);
    expect(actions.loadMemberStateAction).toHaveBeenCalledTimes(1);
    expect(readCart()).toEqual([]);
  });

  it("합치기 전에 바꾼 것은 로그아웃 전에 합쳐 저장하고, 합치지 못하면 로그아웃하지 않게 알린다", async () => {
    const { MemberSync, flushMemberSaves, addToCart } = await load();
    actions.loadMemberStateAction.mockRejectedValue(new Error("offline"));
    render(<MemberSync />);
    addToCart("p-ssd-001"); // 아직 합치지 못했다
    await expect(flushMemberSaves()).resolves.toBe(false);
    expect(actions.saveMemberCartAction).not.toHaveBeenCalled();

    actions.loadMemberStateAction.mockResolvedValue({ cart: [{ productId: "p-gpu-001", quantity: 1 }], build: null });
    await expect(flushMemberSaves()).resolves.toBe(true);
    expect(actions.saveMemberCartAction).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        { productId: "p-ssd-001", quantity: 1 },
        { productId: "p-gpu-001", quantity: 1 },
      ]),
    );
  });

  it("저장하려는데 서버 세션이 끝났으면 로그인 전 모습으로 바꾸고, 더 저장할 곳이 없으니 로그아웃을 막지 않는다", async () => {
    const { MemberSync, flushMemberSaves, readCart } = await load();
    actions.loadMemberStateAction.mockResolvedValue({ cart: [{ productId: "p-gpu-001", quantity: 1 }], build: null });
    actions.saveMemberCartAction.mockResolvedValue("signed-out");
    render(<MemberSync />);
    await expect(flushMemberSaves()).resolves.toBe(true);
    expect(readCart()).toEqual([]);
  });
});
