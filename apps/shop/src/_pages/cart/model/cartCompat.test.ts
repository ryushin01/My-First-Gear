import { describe, expect, it } from "vitest";
import { getProductBySlug } from "@mfg/catalog";
import { cartCompat } from "./cartCompat";

const p = (slug: string) => getProductBySlug(slug)!;

describe("장바구니 호환성 재검사", () => {
  it("소켓이 다른 CPU와 메인보드를 담으면 알려 준다", () => {
    const result = cartCompat([p("amd-ryzen-7-9800x3d"), p("asrock-z890-pro-rs"), p("samsung-990-pro-2tb")]);
    expect(result.issues.some((i) => i.parts.join() === "cpu,mainboard")).toBe(true);
  });

  it("PC 부품이 한 종류뿐이면 검사하지 않는다", () => {
    expect(cartCompat([p("amd-ryzen-7-9800x3d"), p("sony-nw-wm1zm2")]).issues).toEqual([]);
  });

  it("한 PC에 하나만 들어가는 부품이 두 개면 알려 준다", () => {
    expect(cartCompat([p("amd-ryzen-7-9800x3d"), p("amd-ryzen-5-9600x"), p("asus-tuf-gaming-b650-plus")]).duplicates).toEqual(["cpu"]);
  });
});
