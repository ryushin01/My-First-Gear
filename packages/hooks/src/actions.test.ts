import { afterEach, describe, expect, it, vi } from "vitest";
import { ACTION_FAILED_MESSAGE, callAction } from "./actions";

afterEach(() => vi.restoreAllMocks());

describe("callAction", () => {
  it("성공하면 액션의 결과를 그대로 돌려준다", async () => {
    expect(await callAction(async () => ({ ok: true, data: 1 }))).toEqual({ ok: true, data: 1 });
  });

  it("요청이 실패하면 안내 문구가 든 실패 결과로 바꾼다", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(await callAction(() => Promise.reject(new TypeError("Failed to fetch")))).toEqual({ ok: false, message: ACTION_FAILED_MESSAGE });
    expect(
      await callAction(
        () => Promise.reject(new Error("x")),
        () => null,
      ),
    ).toBeNull();
  });

  it("Next의 redirect 신호는 실패로 바꾸지 않고 그대로 던진다", async () => {
    const redirect = Object.assign(new Error("NEXT_REDIRECT"), { digest: "NEXT_REDIRECT;replace;/login;307;" });
    await expect(callAction(() => Promise.reject(redirect))).rejects.toBe(redirect);
  });
});
