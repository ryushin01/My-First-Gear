import { describe, expect, it } from "vitest";
import { getProductBySlug } from "./queries";
import { armSpecs, checkSetup, decodeSetup, deskSpecs, encodeSetup, monitorSizes, setupTotal, toSetup } from "./setup";
import { products } from "./products";

const p = (slug: string) => {
  const product = getProductBySlug(slug);
  if (!product) throw new Error(slug);
  return product;
};

describe("데스크 셋업 조합", () => {
  it("치수 자료는 모두 실제 상품을 가리킨다", () => {
    const slugs = new Set(products.map((x) => x.slug));
    for (const slug of [...Object.keys(monitorSizes), ...Object.keys(armSpecs), ...Object.keys(deskSpecs)]) {
      expect(slugs.has(slug), slug).toBe(true);
    }
  });

  it("모니터가 모니터암의 크기 한도를 넘으면 오류", () => {
    const issues = checkSetup({ monitor: p("samsung-odyssey-oled-g9"), "monitor-arm": p("fellowes-flex-1fm") });
    expect(issues).toContainEqual(expect.objectContaining({ level: "error", message: expect.stringContaining("32인치까지") }));
  });

  it("무게가 한도를 넘으면 오류", () => {
    const issues = checkSetup({ monitor: p("samsung-odyssey-neo-g7-43"), "monitor-arm": p("ergotron-lx") });
    expect(issues.some((i) => i.level === "error")).toBe(true);
  });

  it("맞는 모니터와 암은 문제가 없다", () => {
    expect(checkSetup({ monitor: p("alienware-aw3423dwf"), "monitor-arm": p("ergotron-lx") })).toEqual([]);
  });

  it("듀얼 모니터암은 주의를 준다", () => {
    const issues = checkSetup({ monitor: p("alienware-aw2725df"), "monitor-arm": p("camelmount-cma-2p") });
    expect(issues).toEqual([expect.objectContaining({ level: "warning", slots: ["monitor-arm"] })]);
  });

  it("책상 폭이 모니터와 스피커에 빠듯하면 주의", () => {
    const setup = { desk: p("secretlab-magnus-pro"), monitor: p("samsung-odyssey-oled-g9"), speaker: p("edifier-mr4") };
    expect(checkSetup(setup)).toEqual([expect.objectContaining({ level: "warning", slots: ["monitor", "desk", "speaker"] })]);
    expect(checkSetup({ ...setup, desk: p("linak-dl6-dual-motor") })).toEqual([]);
  });

  it("주소 문자열로 주고받는다", () => {
    const state = { desk: "p-desk-001", monitor: "p-mon-004", mouse: "p-mouse-001" };
    expect(decodeSetup(encodeSetup(state))).toEqual(state);
    expect(decodeSetup("desk:p-chair-001,foo:bar")).toBeNull();
  });

  it("칸과 카테고리가 다른 상품은 버리고 합계를 낸다", () => {
    const setup = toSetup({ desk: "p-desk-002", chair: "p-desk-001", mouse: "p-mouse-002" });
    expect(Object.keys(setup)).toEqual(["desk", "mouse"]);
    expect(setupTotal(setup)).toBe(p("desker-motion-desk-1600").price + p("logitech-mx-master-3s").price);
  });
});
