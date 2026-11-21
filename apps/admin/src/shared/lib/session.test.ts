import { afterEach, describe, expect, it, vi } from "vitest";
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

  afterEach(() => vi.unstubAllEnvs());

  it("운영(Vercel)에서 비밀값이 없으면 서명하지 않는다", async () => {
    vi.stubEnv("MFG_ADMIN_SECRET", "");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL", "1");
    await expect(createSessionValue()).rejects.toThrow("MFG_ADMIN_SECRET");
  });

  it("이 컴퓨터에서 띄운 빌드는 .env 없이도 로그인할 수 있다", async () => {
    vi.stubEnv("MFG_ADMIN_SECRET", "");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL", "");
    const value = await createSessionValue();
    expect(await verifySessionValue(value)).toBe(true);
  });
});
