import { afterEach, describe, expect, it } from "vitest";
import { createLocalStore, parseStringList } from "../createLocalStore";
import { createShareUndo } from "./createShareUndo";

describe("createShareUndo", () => {
  afterEach(() => window.localStorage.clear());

  const setup = () => {
    const store = createLocalStore<string[]>("t:list", [], parseStringList);
    const share = createShareUndo(store, "t:list:previous", {
      parse: parseStringList,
      isEmpty: (value) => value.length === 0,
      same: (a, b) => a.join() === b.join(),
    });
    return { store, share };
  };

  it("공유 값으로 바꾸고 고르던 값을 남겨 되돌린다", () => {
    const { store, share } = setup();
    store.set(["mine"]);
    share.apply(["shared"]);
    expect(store.get()).toEqual(["shared"]);
    share.restore();
    expect(store.get()).toEqual(["mine"]);
    expect(window.localStorage.getItem("t:list:previous")).toBe("null");
  });

  it("고르던 값이 비어 있거나 공유 값과 같으면 남기지 않는다", () => {
    const { store, share } = setup();
    share.apply(["shared"]);
    expect(window.localStorage.getItem("t:list:previous")).toBe("null");
    share.apply(["shared"]);
    expect(store.get()).toEqual(["shared"]);
  });
});
