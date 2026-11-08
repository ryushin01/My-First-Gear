import { describe, expect, it } from "vitest";
import { createSessionValue, verifySessionValue } from "./session";

describe("어드민 세션 쿠키", () => {
  it("서명한 값은 통과하고, 만료되거나 고친 값은 거절한다", async () => {
    const now = Date.now();
    const value = await createSessionValue(now);
    expect(await verifySessionValue(value, now)).toBe(true);
    expect(await verifySessionValue(value, now + 9 * 60 * 60 * 1000)).toBe(false);
    const [expires, signature] = value.split(".");
    expect(await verifySessionValue(`${Number(expires) + 1000}.${signature}`, now)).toBe(false);
    expect(await verifySessionValue(undefined, now)).toBe(false);
  });
});
