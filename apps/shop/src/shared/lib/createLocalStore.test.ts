import { afterEach, describe, expect, it } from "vitest";
import { createLocalStore } from "./createLocalStore";

const isRecord = (value: unknown): value is Record<string, string> => typeof value === "object" && value !== null && !Array.isArray(value);

describe("createLocalStore", () => {
  afterEach(() => window.localStorage.clear());

  it("저장된 값을 읽고 쓴다", () => {
    window.localStorage.setItem("t:ok", JSON.stringify({ a: "1" }));
    const store = createLocalStore<Record<string, string>>("t:ok", {}, isRecord);
    expect(store.get()).toEqual({ a: "1" });
    store.set((prev) => ({ ...prev, b: "2" }));
    expect(JSON.parse(window.localStorage.getItem("t:ok")!)).toEqual({ a: "1", b: "2" });
  });

  it.each([["null"], ['"text"'], ["[1,2]"], ["{broken"]])("모양이 다른 값(%s)은 초기값으로 바꾼다", (raw) => {
    window.localStorage.setItem("t:bad", raw);
    const store = createLocalStore<Record<string, string>>("t:bad", {}, isRecord);
    expect(store.get()).toEqual({});
  });
});
