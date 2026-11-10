import { describe, expect, it } from "vitest";
import { recommendBuild } from "./recommend";
import { checkBuild } from "./compatibility";
import { searchProducts } from "./search";

describe("상품 검색", () => {
  it("낱말이 모두 들어간 상품만, 이름에 맞는 것을 먼저 찾는다", () => {
    expect(searchProducts("AM5 메인보드").map((p) => p.slug)).toEqual(["asus-tuf-gaming-b650-plus", "msi-mag-b650m-mortar-wifi"]);
    expect(searchProducts("소니 헤드폰")[0].slug).toBe("sony-wh-1000xm6");
    expect(searchProducts("  ")).toEqual([]);
    expect(searchProducts("없는상품이름")).toEqual([]);
  });

  it("카테고리의 다른 이름으로도 찾는다", () => {
    expect(searchProducts("허먼밀러 체어").map((p) => p.slug)).toEqual(["herman-miller-aeron"]);
    expect(searchProducts("모션데스크").map((p) => p.slug)).toContain("secretlab-magnus-pro");
    expect(searchProducts("스틸시리즈 헤드셋").map((p) => p.slug)).toEqual(["steelseries-arctis-nova-pro-wireless"]);
  });
});

describe("예산별 빠른 견적", () => {
  it("게임용은 예산 안에서 호환되는 구성을 고르고 그래픽카드를 넣는다", () => {
    const result = recommendBuild(2_000_000, "game")!;
    expect(result.total).toBeLessThanOrEqual(2_000_000);
    expect(result.build.gpu).toBeDefined();
    expect(checkBuild(result.build).filter((i) => i.level === "error")).toEqual([]);
  });

  it("사무용은 내장 그래픽이면 그래픽카드 없이 가장 저렴하게 고른다", () => {
    const result = recommendBuild(1_500_000, "office")!;
    expect(result.build.gpu).toBeUndefined();
    expect(result.build.cpu?.slug).toBe("amd-ryzen-5-9600x");
  });

  it("예산이 너무 적으면 null", () => {
    expect(recommendBuild(300_000, "game")).toBeNull();
  });
});
