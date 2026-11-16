import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const actions = vi.hoisted(() => ({
  loadMemberStateAction: vi.fn(),
  checkMemberSessionAction: vi.fn(),
  saveMemberCartAction: vi.fn(),
  saveMemberBuildAction: vi.fn(),
}));
vi.mock("../api/memberSync", () => actions);
// 재입고 버튼이 서버 액션(server-only)을 불러오므로 머리글 알림 수만 흉내 낸다
vi.mock("@/features/restock-alert", () => ({ applyRestockedCount: vi.fn(), nextRestockRequest: vi.fn(() => 1), resetRestockedCount: vi.fn() }));

const OWNER_KEY = "mfg:member-owner";

// 동기화 상태(불러온 회원, 마지막 확인 시각)가 모듈에 남으므로 테스트마다 새로 불러온다.
async function load() {
  vi.resetModules();
  const [{ MemberSync }, member, cart] = await Promise.all([import("./MemberSync"), import("@/entities/member"), import("@/entities/cart")]);
  return { MemberSync, ...member, ...cart };
}

describe("MemberSync", () => {
  beforeEach(() => {
    // 저장 타이머(0.8초)를 직접 다룬다. 모듈을 새로 불러와도 이전 모듈의 타이머가 다음 테스트로 넘어가지 않게 끝날 때 지운다.
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
    vi.clearAllMocks();
    window.localStorage.clear();
    document.cookie = "mfg_member=member; path=/";
    actions.loadMemberStateAction.mockResolvedValue({ owner: "tag-a", cart: [], build: null, restocked: 0 });
    actions.checkMemberSessionAction.mockResolvedValue("ok");
    actions.saveMemberCartAction.mockResolvedValue("saved");
    actions.saveMemberBuildAction.mockResolvedValue("saved");
  });
  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("이미 불러온 회원이어도 화면을 옮기면 1분에 한 번 서버 세션을 확인하고, 끝났으면 이 기기의 회원 장바구니를 지운다", async () => {
    const { MemberSync, flushMemberSaves, addToCart, readCart } = await load();
    render(<MemberSync />);
    // 로그아웃 전 동기화는 불러오는 중인 요청을 함께 기다렸다가 바로 저장한다(0.8초를 기다리지 않음)
    await expect(flushMemberSaves()).resolves.toBe(true);
    expect(actions.loadMemberStateAction).toHaveBeenCalledTimes(1);
    expect(actions.saveMemberCartAction).toHaveBeenCalledWith("tag-a", []);
    expect(window.localStorage.getItem(OWNER_KEY)).toBe("tag-a");
    addToCart("p-ssd-001");
    cleanup();

    // 1분 안에 다른 화면으로 옮기면 다시 확인하지 않는다
    render(<MemberSync />);
    cleanup();
    expect(actions.checkMemberSessionAction).not.toHaveBeenCalled();

    // 1분이 지나 옮기면 불러오기는 건너뛰되 세션은 확인한다
    vi.setSystemTime(Date.now() + 61_000);
    actions.checkMemberSessionAction.mockResolvedValue("signed-out");
    const changed = vi.fn();
    window.addEventListener("mfg:member", changed);
    render(<MemberSync />);
    await vi.waitFor(() => expect(changed).toHaveBeenCalled());
    window.removeEventListener("mfg:member", changed);
    expect(actions.checkMemberSessionAction).toHaveBeenCalledTimes(1);
    expect(actions.loadMemberStateAction).toHaveBeenCalledTimes(1);
    expect(readCart()).toEqual([]);
    expect(window.localStorage.getItem(OWNER_KEY)).toBeNull();
  });

  it("합치기 전에 바꾼 것은 로그아웃 전에 합쳐 저장하고, 합치지 못하면 로그아웃하지 않게 알린다", async () => {
    const { MemberSync, flushMemberSaves, addToCart } = await load();
    actions.loadMemberStateAction.mockRejectedValue(new Error("offline"));
    render(<MemberSync />);
    addToCart("p-ssd-001"); // 아직 합치지 못했다
    await expect(flushMemberSaves()).resolves.toBe(false);
    expect(actions.saveMemberCartAction).not.toHaveBeenCalled();

    actions.loadMemberStateAction.mockResolvedValue({ owner: "tag-a", cart: [{ productId: "p-gpu-001", quantity: 1 }], build: null });
    await expect(flushMemberSaves()).resolves.toBe(true);
    expect(actions.saveMemberCartAction).toHaveBeenLastCalledWith(
      "tag-a",
      expect.arrayContaining([
        { productId: "p-ssd-001", quantity: 1 },
        { productId: "p-gpu-001", quantity: 1 },
      ]),
    );
  });

  it("저장하려는데 서버 세션이 끝났으면 로그인 전 모습으로 바꾸고, 더 저장할 곳이 없으니 로그아웃을 막지 않는다", async () => {
    const { MemberSync, flushMemberSaves, readCart } = await load();
    actions.loadMemberStateAction.mockResolvedValue({ owner: "tag-a", cart: [{ productId: "p-gpu-001", quantity: 1 }], build: null });
    actions.saveMemberCartAction.mockResolvedValue("signed-out");
    render(<MemberSync />);
    await expect(flushMemberSaves()).resolves.toBe(true);
    expect(readCart()).toEqual([]);
  });

  it("이 기기에 다른 회원의 값이 남아 있으면 새 회원 계정에 합치지 않고 버린다(손님 값은 합친다)", async () => {
    const { MemberSync, flushMemberSaves, addToCart, readCart } = await load();
    addToCart("p-ssd-001");
    window.localStorage.setItem(OWNER_KEY, "tag-other"); // 로그아웃하지 않은 다른 회원의 장바구니
    actions.loadMemberStateAction.mockResolvedValue({ owner: "tag-a", cart: [{ productId: "p-gpu-001", quantity: 1 }], build: null });
    render(<MemberSync />);
    await expect(flushMemberSaves()).resolves.toBe(true);
    expect(readCart()).toEqual([{ productId: "p-gpu-001", quantity: 1 }]);
    expect(actions.saveMemberCartAction).toHaveBeenLastCalledWith("tag-a", [{ productId: "p-gpu-001", quantity: 1 }]);
    expect(window.localStorage.getItem(OWNER_KEY)).toBe("tag-a");
  });

  it("다른 탭에서 다른 회원으로 로그인했다는 응답이면 저장을 멈추고 이 기기의 값은 지우지 않는다", async () => {
    const { MemberSync, flushMemberSaves, readCart } = await load();
    actions.loadMemberStateAction.mockResolvedValue({ owner: "tag-a", cart: [{ productId: "p-gpu-001", quantity: 1 }], build: null });
    actions.saveMemberCartAction.mockResolvedValue("other-member");
    render(<MemberSync />);
    await expect(flushMemberSaves()).resolves.toBe(true);
    expect(readCart()).toEqual([{ productId: "p-gpu-001", quantity: 1 }]);
    await vi.advanceTimersByTimeAsync(1000);
    expect(actions.saveMemberCartAction).toHaveBeenCalledTimes(1);
  });

  it("이전 회원의 저장 결과가 늦게 와도 지금 회원의 동기화를 멈추지 않는다", async () => {
    const { MemberSync, flushMemberSaves, notifyMemberChanged, addToCart } = await load();
    let finishA: (result: string) => void = () => {};
    actions.saveMemberCartAction.mockImplementationOnce(() => new Promise((resolve) => (finishA = resolve)));
    render(<MemberSync />);
    await vi.waitFor(() => expect(actions.loadMemberStateAction).toHaveBeenCalledTimes(1));
    await vi.advanceTimersByTimeAsync(800); // 회원 A의 저장이 나갔고 응답을 기다린다
    expect(actions.saveMemberCartAction).toHaveBeenCalledWith("tag-a", []);

    // 다른 탭에서 회원 B로 로그인했다
    document.cookie = "mfg_member=member-b; path=/";
    actions.loadMemberStateAction.mockResolvedValue({ owner: "tag-b", cart: [], build: null });
    await act(async () => notifyMemberChanged());
    await vi.waitFor(() => expect(actions.loadMemberStateAction).toHaveBeenCalledTimes(2));
    await vi.advanceTimersByTimeAsync(0);

    finishA("other-member"); // A의 응답이 늦게 왔다
    await vi.advanceTimersByTimeAsync(0);
    addToCart("p-ssd-001");
    await expect(flushMemberSaves()).resolves.toBe(true);
    expect(actions.saveMemberCartAction).toHaveBeenLastCalledWith("tag-b", [{ productId: "p-ssd-001", quantity: 1 }]);
    // B의 동기화가 끊기지 않아 다시 불러오지 않는다
    expect(actions.loadMemberStateAction).toHaveBeenCalledTimes(2);
  });

  it("세션이 끝났다는 응답은 서버가 회원 쿠키를 함께 지워도 바로 정리한다", async () => {
    const { MemberSync, addToCart, readCart } = await load();
    addToCart("p-ssd-001");
    window.localStorage.setItem(OWNER_KEY, "tag-a");
    actions.loadMemberStateAction.mockImplementation(async () => {
      document.cookie = "mfg_member=; path=/; max-age=0"; // 같은 응답에서 쿠키가 지워진다
      return "signed-out";
    });
    const changed = vi.fn();
    window.addEventListener("mfg:member", changed);
    render(<MemberSync />);
    await vi.waitFor(() => expect(changed).toHaveBeenCalled());
    window.removeEventListener("mfg:member", changed);
    expect(readCart()).toEqual([]);
  });

  it("이전 회원의 불러오기가 늦게 세션 종료로 와도 지금 회원의 값을 지우지 않는다", async () => {
    const { MemberSync, notifyMemberChanged, readCart } = await load();
    let finishA: (result: unknown) => void = () => {};
    actions.loadMemberStateAction.mockImplementationOnce(() => new Promise((resolve) => (finishA = resolve)));
    render(<MemberSync />); // 회원 A를 불러오는 중

    // 다른 탭에서 회원 B로 로그인했고, B를 먼저 불러와 합쳤다
    document.cookie = "mfg_member=member-b; path=/";
    actions.loadMemberStateAction.mockResolvedValueOnce({ owner: "tag-b", cart: [{ productId: "p-gpu-001", quantity: 1 }], build: null });
    await act(async () => notifyMemberChanged());
    await vi.waitFor(() => expect(readCart()).toEqual([{ productId: "p-gpu-001", quantity: 1 }]));

    finishA("signed-out"); // A의 응답이 늦게 왔다
    await vi.advanceTimersByTimeAsync(0);
    expect(readCart()).toEqual([{ productId: "p-gpu-001", quantity: 1 }]);
    expect(window.localStorage.getItem(OWNER_KEY)).toBe("tag-b");
  });

  it("회원 쿠키 없이 회원 값만 남아 있으면(세션이 끝난 뒤 다시 옴) 지운다", async () => {
    const { MemberSync, addToCart, readCart } = await load();
    document.cookie = "mfg_member=; path=/; max-age=0";
    addToCart("p-ssd-001");
    window.localStorage.setItem(OWNER_KEY, "tag-a");
    render(<MemberSync />);
    expect(readCart()).toEqual([]);
    expect(window.localStorage.getItem(OWNER_KEY)).toBeNull();
  });

  it("처음 그릴 때(하이드레이션) 회원 이름이 잠시 비어 있어도 회원 장바구니를 지우지 않는다", async () => {
    const { MemberSync, addToCart, readCart } = await load();
    addToCart("p-ssd-001");
    window.localStorage.setItem(OWNER_KEY, "tag-a");
    const container = document.createElement("div");
    document.body.append(container);
    // 서버에서 그린 결과(빈 화면)에 붙인다. 첫 렌더는 서버 값(null)을 쓴다.
    const { hydrateRoot } = await import("react-dom/client");
    const { act } = await import("react");
    await act(async () => {
      hydrateRoot(container, <MemberSync />);
    });
    expect(readCart()).toEqual(expect.arrayContaining([{ productId: "p-ssd-001", quantity: 1 }]));
    container.remove();
  });

  it("손님 장바구니는 회원 쿠키가 없어도 그대로 둔다", async () => {
    const { MemberSync, addToCart, readCart } = await load();
    document.cookie = "mfg_member=; path=/; max-age=0";
    addToCart("p-ssd-001");
    render(<MemberSync />);
    expect(readCart()).toEqual([{ productId: "p-ssd-001", quantity: 1 }]);
  });
});
