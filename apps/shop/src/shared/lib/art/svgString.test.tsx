import { describe, expect, it } from "vitest";
import { GearArtSvg } from "@mfg/gear-art/server";
import { toSvgString } from "./svgString";

describe("toSvgString", () => {
  it("상품 그림을 SVG 문자열로 바꾸고 카멜 속성을 SVG 속성으로 고친다", () => {
    const svg = toSvgString(<GearArtSvg art={{ kind: "cpu", accent: "#ff3131" }} xmlns="http://www.w3.org/2000/svg" />);
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).toContain('viewBox="0 0 200 200"');
    expect(svg).toContain('stroke-width="2.5"');
    expect(svg).not.toContain("strokeWidth");
    expect(svg).toContain('aria-hidden="true"');
  });
});
