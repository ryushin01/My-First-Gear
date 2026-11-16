import { afterEach, describe, expect, it, vi } from "vitest";

async function load() {
  vi.resetModules();
  return import("./deviceOwner");
}

describe("기기 값의 주인 표식", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it("저장소에 적고 읽는다", async () => {
    const { readDeviceOwner, writeDeviceOwner } = await load();
    expect(readDeviceOwner()).toBeNull();
    writeDeviceOwner("tag-a");
    expect(window.localStorage.getItem("mfg:member-owner")).toBe("tag-a");
    expect(readDeviceOwner()).toBe("tag-a");
    writeDeviceOwner(null);
    expect(readDeviceOwner()).toBeNull();
  });

  it("저장소를 쓸 수 없으면 손님(null)으로 보지 않고 이 탭에서 마지막으로 적은 값을 쓴다", async () => {
    const { readDeviceOwner, writeDeviceOwner } = await load();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    writeDeviceOwner("tag-a");
    expect(readDeviceOwner()).toBe("tag-a");
  });

  it("읽기가 막혀도 마지막으로 적은 값을 쓴다", async () => {
    const { readDeviceOwner, writeDeviceOwner } = await load();
    writeDeviceOwner("tag-a");
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    expect(readDeviceOwner()).toBe("tag-a");
  });
});
