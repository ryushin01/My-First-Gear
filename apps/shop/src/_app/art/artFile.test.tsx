import { describe, expect, it } from "vitest";
import { products } from "@mfg/catalog";
import { models } from "@mfg/gear-art/server";
import { GET, generateStaticParams, productArtSvg } from "./artFile";

const request = (file: string) => GET(new Request(`http://x/art/${file}`), { params: Promise.resolve({ file }) });

describe("상품 그림 파일", () => {
  it("상품마다 그림 파일을 하나씩 미리 만든다", () => {
    const files = generateStaticParams().map((params) => params.file);
    expect(files).toHaveLength(products.length);
    expect(new Set(files).size).toBe(files.length);
  });

  it("그림 파일은 선 색을 직접 칠한 올바른 SVG 문서다", () => {
    const parser = new DOMParser();
    for (const product of products) {
      const svg = productArtSvg(product.slug) ?? "";
      expect(svg, product.slug).toMatch(/^<svg[^>]*xmlns="http:\/\/www.w3.org\/2000\/svg"/);
      expect(svg, product.slug).not.toContain("currentColor");
      expect(parser.parseFromString(svg, "image/svg+xml").querySelector("parsererror"), product.slug).toBeNull();
    }
  });

  it("실사풍 그림은 모두 상품에 쓰이고, 그 상품은 실사풍 그림 파일을 받는다", () => {
    const used = new Set(products.map((p) => p.art.model).filter((model) => model !== undefined && Object.hasOwn(models, model)));
    expect(used.size).toBeGreaterThan(80);
    expect(Object.keys(models).filter((key) => !used.has(key))).toEqual([]);
    // 실사풍 그림은 선 없이 면으로 칠한 묶음(<g stroke="none">)으로 들어간다.
    expect(productArtSvg("bang-olufsen-a8")).toContain('<g stroke="none">');
  });

  it("없는 상품은 404, 있는 상품은 SVG로 답한다", async () => {
    const ok = await request("bang-olufsen-a8.svg");
    expect(ok.status).toBe(200);
    expect(ok.headers.get("content-type")).toContain("image/svg+xml");
    expect((await request("no-such-product.svg")).status).toBe(404);
    expect((await request("bang-olufsen-a8.png")).status).toBe(404);
  });
});
