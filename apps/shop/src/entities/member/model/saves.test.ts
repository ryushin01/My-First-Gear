import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// 저장기 목록이 모듈에 남으므로 테스트마다 새로 불러온다.
async function load() {
  vi.resetModules();
  return import("./saves");
}

describe("회원 저장 모으기", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("바뀐 뒤 0.8초 동안 더 바뀌지 않으면 한 번만 저장한다", async () => {
    const { createMemberSaver } = await load();
    const save = vi.fn().mockResolvedValue(undefined);
    const saver = createMemberSaver(save);
    saver.schedule();
    await vi.advanceTimersByTimeAsync(500);
    saver.schedule();
    await vi.advanceTimersByTimeAsync(799);
    expect(save).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("로그아웃 전에는 기다리지 않고 바로 보내고, 서버가 받았는지 알려 준다", async () => {
    const { createMemberSaver, flushMemberSaves } = await load();
    const save = vi.fn().mockResolvedValue(undefined);
    createMemberSaver(save).schedule();
    await expect(flushMemberSaves()).resolves.toBe(true);
    expect(save).toHaveBeenCalledTimes(1);
    // 보낼 것이 없으면 다시 보내지 않는다
    await expect(flushMemberSaves()).resolves.toBe(true);
    await vi.advanceTimersByTimeAsync(1000);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("저장에 실패하면 false를 돌려주고, 다음에 다시 보낸다", async () => {
    const { createMemberSaver, flushMemberSaves } = await load();
    const save = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue(undefined);
    const saver = createMemberSaver(save);
    saver.schedule();
    await expect(flushMemberSaves()).resolves.toBe(false);
    await expect(saver.flush()).resolves.toBe(true);
    expect(save).toHaveBeenCalledTimes(2);
  });

  it("보내는 중이면 끝날 때까지 기다린다", async () => {
    const { createMemberSaver, flushMemberSaves } = await load();
    let finish = () => {};
    const save = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    createMemberSaver(save).schedule();
    await vi.advanceTimersByTimeAsync(800); // 타이머가 저장을 시작했다
    let done = false;
    const flushed = flushMemberSaves().then((ok) => (done = ok));
    await vi.advanceTimersByTimeAsync(0);
    expect(done).toBe(false);
    finish();
    await flushed;
    expect(done).toBe(true);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("저장기가 여럿이면 하나라도 실패할 때 false", async () => {
    const { createMemberSaver, flushMemberSaves } = await load();
    createMemberSaver(vi.fn().mockResolvedValue(undefined)).schedule();
    createMemberSaver(vi.fn().mockRejectedValue(new Error("db"))).schedule();
    await expect(flushMemberSaves()).resolves.toBe(false);
  });
});
