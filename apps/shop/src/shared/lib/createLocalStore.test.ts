import { afterEach, describe, expect, it } from "vitest";
import { createLocalStore, parseStringList } from "./createLocalStore";

const parseRecord = (value: unknown) =>
  typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Record<string, string>) : null;

describe("createLocalStore", () => {
  afterEach(() => window.localStorage.clear());

  it("저장된 값을 읽고 쓴다", () => {
    window.localStorage.setItem("t:ok", JSON.stringify({ a: "1" }));
    const store = createLocalStore<Record<string, string>>("t:ok", {}, parseRecord);
    expect(store.get()).toEqual({ a: "1" });
    store.set((prev) => ({ ...prev, b: "2" }));
    expect(JSON.parse(window.localStorage.getItem("t:ok")!)).toEqual({ a: "1", b: "2" });
  });

  it.each([["null"], ['"text"'], ["[1,2]"], ["{broken"]])("모양이 다른 값(%s)은 초기값으로 바꾼다", (raw) => {
    window.localStorage.setItem("t:bad", raw);
    const store = createLocalStore<Record<string, string>>("t:bad", {}, parseRecord);
    expect(store.get()).toEqual({});
  });

  it("다른 탭에서 바뀌어 다시 읽을 때도 깨진 값은 초기값으로 바꾼다", () => {
    window.localStorage.setItem("t:tab", JSON.stringify(["a"]));
    const store = createLocalStore<string[]>("t:tab", [], parseStringList);
    const off = store.subscribe(() => undefined);
    expect(store.get()).toEqual(["a"]);
    window.localStorage.setItem("t:tab", "{}");
    window.dispatchEvent(new StorageEvent("storage", { key: "t:tab" }));
    expect(store.get()).toEqual([]);
    off();
  });
});

describe("parseStringList", () => {
  it("배열이 아니면 null, 문자열이 아닌 항목은 뺀다", () => {
    expect(parseStringList({})).toBeNull();
    expect(parseStringList("x")).toBeNull();
    expect(parseStringList(["a", 1, null, "b"])).toEqual(["a", "b"]);
  });
});
