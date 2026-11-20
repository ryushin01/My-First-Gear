import { describe, expect, it } from "vitest";
import { categories } from "../categories";
import { nativeProducts, products } from "../products";
import { vAliases } from "./aliases";
import type { PlannerFeed, PlannerFeedItem } from "./feeds";
import { linkToV, productsFromV } from "./fromV";
import { shopFeed } from "./shopFeed";
import { vFeed } from "./vFeed";

const feed = (items: PlannerFeedItem[]): PlannerFeed => ({ version: 1, source: "v", items });
const model = (id: string, over: Partial<PlannerFeedItem> = {}): PlannerFeedItem => ({
  id,
  name: `모델 ${id}`,
  brand: "Brand",
  kind: "speaker",
  category: "audio",
  layer: "surface",
  width: 15,
  depth: 20,
  watts: 0,
  cable: 150,
  ...over,
});

describe("V 카탈로그 동기화", () => {
  it("상품 id와 slug가 겹치지 않는다", () => {
    expect(new Set(products.map((p) => p.id)).size).toBe(products.length);
    expect(new Set(products.map((p) => p.slug)).size).toBe(products.length);
  });

  it("가져온 상품은 모두 아는 카테고리에 들어가고 판매가와 V 모델 id가 있다", () => {
    const known = new Set(categories.map((c) => c.id));
    const imported = products.filter((p) => p.source === "v");
    expect(imported.length).toBeGreaterThan(0);
    for (const p of imported) {
      expect(known.has(p.categoryId)).toBe(true);
      expect(p.price).toBeGreaterThan(0);
      expect(p.vModelId).toBeTruthy();
    }
  });

  it("별칭 표의 slug와 V 모델 id는 실제로 있고, 그 모델은 다시 가져오지 않는다", () => {
    const slugs = new Set(nativeProducts.map((p) => p.slug));
    const vIds = new Set(vFeed.items.map((item) => item.id));
    const imported = new Set(products.filter((p) => p.source === "v").map((p) => p.vModelId));
    for (const [slug, ids] of Object.entries(vAliases)) {
      expect(slugs.has(slug)).toBe(true);
      for (const id of ids) {
        expect(vIds.has(id)).toBe(true);
        expect(imported.has(id)).toBe(false);
      }
    }
  });

  it("스피커 한 쌍과 사운드바·서브우퍼를 한 상품으로 묶는다", () => {
    const list = productsFromV(
      feed([
        model("acme-x-active", { name: "X 액티브 스피커 (오른쪽)", watts: 30 }),
        model("acme-x-passive", { name: "X 패시브 스피커 (왼쪽)" }),
        model("acme-bar", { name: "바 사운드바", kind: "soundbar", watts: 40 }),
        model("acme-bar-sub", { name: "바 서브우퍼", kind: "subwoofer", watts: 20 }),
      ]),
      [],
    );
    expect(list.map((p) => [p.slug, p.name])).toEqual([
      ["acme-x", "Brand X 스피커 (한 쌍)"],
      ["acme-bar", "Brand 바 사운드바 (서브우퍼 포함)"],
    ]);
    expect(list[0].vModelId).toBe("acme-x-active");
    expect(list[1].specs.find((s) => s.label === "소비 전력")?.value).toBe("60W");
  });

  it("이미 파는 제품(slug나 별칭이 같은 것)과 쇼핑몰에 없는 종류는 건너뛴다", () => {
    const native = nativeProducts.filter((p) => p.slug === "edifier-qr65");
    const list = productsFromV(feed([model("edifier-qr65-active"), model("edifier-qr65-passive"), model("acme-window", { kind: "window" })]), native);
    expect(list).toEqual([]);
  });

  it("같은 모델에는 늘 같은 가격·재고·평점을 준다", () => {
    expect(productsFromV(vFeed, nativeProducts)).toEqual(productsFromV(vFeed, nativeProducts));
  });

  it("V에도 있는 상품에 V 모델 id를 단다", () => {
    const linked = linkToV(nativeProducts, vFeed);
    expect(linked.find((p) => p.slug === "samsung-odyssey-oled-g9")?.vModelId).toBe("samsung-odyssey-oled-g9");
    expect(linked.find((p) => p.slug === "playstation-5-pro")?.vModelId).toBe("sony-ps5-pro");
    expect(linked.find((p) => p.slug === "amd-ryzen-7-9800x3d")?.vModelId).toBeUndefined();
  });
});

describe("쇼핑몰 피드", () => {
  it("직접 올린 상품만 싣고 V 별칭과 놓는 자리를 함께 보낸다", () => {
    const items = shopFeed().items;
    expect(items).toHaveLength(nativeProducts.length);
    const imported = new Set(products.filter((p) => p.source === "v").map((p) => p.slug));
    expect(items.some((item) => imported.has(item.id))).toBe(false);
    expect(items.find((item) => item.id === "edifier-qr65")?.aliases).toEqual(["edifier-qr65-active", "edifier-qr65-passive"]);
    expect(items.find((item) => item.id === "roland-fantom-08")).toMatchObject({ widthCm: 139.3, depthCm: 35.4 });
    expect(items.find((item) => item.id === "lg-ultragear-oled-45gx950a")).toMatchObject({ diagonalInch: 45, aspect: "21:9" });
    expect(items.find((item) => item.id === "phoenix-keyboard")?.layout).toBe("텐키리스 F13 (88키)");
  });
});
