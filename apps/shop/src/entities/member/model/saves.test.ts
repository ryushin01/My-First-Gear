import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMemberSaver, flushMemberSaves, setMemberSyncHandler } from "./saves";

describe("회원 저장 모으기", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("바뀐 뒤 0.8초 동안 더 바뀌지 않으면 한 번만 저장한다", async () => {
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

  it("flush는 기다리지 않고 바로 보내고, 보낼 것이 없으면 다시 보내지 않는다", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const saver = createMemberSaver(save);
    saver.schedule();
    await expect(saver.flush()).resolves.toBe(true);
    await expect(saver.flush()).resolves.toBe(true);
    await vi.advanceTimersByTimeAsync(1000);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("저장에 실패하면 false를 돌려주고, 다음에 다시 보낸다", async () => {
    const save = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue(undefined);
    const saver = createMemberSaver(save);
    saver.schedule();
    await expect(saver.flush()).resolves.toBe(false);
    await expect(saver.flush()).resolves.toBe(true);
    expect(save).toHaveBeenCalledTimes(2);
  });

  it("보내는 사이 또 바뀌면 그것까지 보낸 뒤에 끝난다", async () => {
    const resolvers: Array<() => void> = [];
    const save = vi.fn(() => new Promise<void>((resolve) => resolvers.push(resolve)));
    const saver = createMemberSaver(save);
    saver.schedule();
    let done: boolean | null = null;
    const flushed = saver.flush().then((ok) => (done = ok));
    await vi.advanceTimersByTimeAsync(0);
    expect(save).toHaveBeenCalledTimes(1);
    saver.schedule(); // 보내는 사이 또 바뀌었다
    resolvers[0]();
    await vi.advanceTimersByTimeAsync(0);
    expect(done).toBeNull();
    expect(save).toHaveBeenCalledTimes(2);
    resolvers[1]();
    await flushed;
    expect(done).toBe(true);
    await vi.advanceTimersByTimeAsync(1000);
    expect(save).toHaveBeenCalledTimes(2); // 타이머로 한 번 더 보내지 않는다
  });

  it("cancel하면 남은 저장을 버린다", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const saver = createMemberSaver(save);
    saver.schedule();
    saver.cancel();
    await vi.advanceTimersByTimeAsync(1000);
    await expect(saver.flush()).resolves.toBe(true);
    expect(save).not.toHaveBeenCalled();
  });

  it("보내는 중에 cancel하면 그 저장이 실패해도 다시 보내지 않는다", async () => {
    let fail = () => {};
    const save = vi.fn(() => new Promise<void>((_, reject) => (fail = () => reject(new Error("offline")))));
    const saver = createMemberSaver(save);
    saver.schedule();
    const flushed = saver.flush();
    await vi.advanceTimersByTimeAsync(0);
    saver.cancel();
    fail();
    await expect(flushed).resolves.toBe(false);
    await expect(saver.flush()).resolves.toBe(true);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("보내는 중이면 끝날 때까지 기다린다", async () => {
    let finish = () => {};
    const save = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    const saver = createMemberSaver(save);
    saver.schedule();
    await vi.advanceTimersByTimeAsync(800); // 타이머가 저장을 시작했다
    let done = false;
    const flushed = saver.flush().then((ok) => (done = ok));
    await vi.advanceTimersByTimeAsync(0);
    expect(done).toBe(false);
    finish();
    await flushed;
    expect(done).toBe(true);
    expect(save).toHaveBeenCalledTimes(1);
  });
});

describe("로그아웃 전 동기화", () => {
  afterEach(() => setMemberSyncHandler(null));

  it("회원 동기화가 없으면 맞출 것이 없다", async () => {
    await expect(flushMemberSaves()).resolves.toBe(true);
  });

  it("회원 동기화의 결과를 돌려주고, 던지면 받지 못한 것으로 본다", async () => {
    setMemberSyncHandler(async () => false);
    await expect(flushMemberSaves()).resolves.toBe(false);
    setMemberSyncHandler(async () => {
      throw new Error("offline");
    });
    await expect(flushMemberSaves()).resolves.toBe(false);
  });
});
