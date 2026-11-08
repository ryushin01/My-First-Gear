import { describe, expect, it } from "vitest";
import { checkBuild, estimateWatts, fitsBuild, recommendedWatts, type Build } from "./compatibility";
import { getProductBySlug } from "./queries";

const p = (slug: string) => {
  const product = getProductBySlug(slug);
  if (!product) throw new Error(`no product ${slug}`);
  return product;
};

const goodBuild: Build = {
  cpu: p("amd-ryzen-7-9800x3d"),
  mainboard: p("asus-tuf-gaming-b650-plus"),
  memory: p("samsung-ddr5-5600-32gb-kit"),
  gpu: p("geforce-rtx-5070-ti-16gb"),
  storage: p("samsung-990-pro-2tb"),
  psu: p("seasonic-focus-gx-850"),
  case: p("antec-torque"),
  cooler: p("thermalright-peerless-assassin-120-se"),
};

describe("checkBuild", () => {
  it("호환되는 구성에는 문제가 없다", () => {
    expect(checkBuild(goodBuild)).toEqual([]);
  });

  it("CPU와 메인보드 소켓이 다르면 오류", () => {
    const issues = checkBuild({ ...goodBuild, mainboard: p("asrock-z890-pro-rs") });
    expect(issues).toContainEqual(expect.objectContaining({ level: "error", parts: ["cpu", "mainboard"] }));
  });

  it("ITX 케이스에 ATX 보드와 ATX 파워는 들어가지 않는다", () => {
    const issues = checkBuild({ ...goodBuild, case: p("cooler-master-nr200p") });
    const pairs = issues.map((issue) => issue.parts.join("+"));
    expect(pairs).toContain("mainboard+case");
    expect(pairs).toContain("psu+case");
  });

  it("그래픽카드가 케이스보다 길면 오류", () => {
    const issues = checkBuild({ ...goodBuild, gpu: p("radeon-rx-9070-xt-16gb"), case: p("antec-torque") });
    expect(issues.some((i) => i.parts.join() === "gpu,case")).toBe(false); // 330mm = 허용 330mm
    const longCase = { ...p("antec-torque"), compat: { ...goodBuild.case!.compat!, maxGpuLengthMm: 300 } } as typeof goodBuild.case;
    expect(checkBuild({ ...goodBuild, case: longCase }).some((i) => i.parts.join() === "gpu,case")).toBe(true);
  });

  it("쿨러가 케이스보다 높으면 오류", () => {
    const issues = checkBuild({ ...goodBuild, cooler: p("noctua-nh-d15-g2"), case: p("fractal-north") });
    expect(issues).toEqual([]);
    const tall = checkBuild({ ...goodBuild, cooler: p("noctua-nh-d15-g2") });
    expect(tall.some((i) => i.parts.join() === "cooler,case")).toBe(false); // 168 < 170
  });

  it("파워가 예상 소비 전력보다 낮으면 오류, 여유가 적으면 주의", () => {
    expect(estimateWatts(goodBuild)).toBe(100 + 120 + 300);
    expect(recommendedWatts(goodBuild)).toBe(750);
    const weak = checkBuild({ ...goodBuild, psu: p("micronics-classic-ii-600") });
    expect(weak).toContainEqual(expect.objectContaining({ level: "warning", parts: ["psu"] }));
  });
});

describe("fitsBuild", () => {
  it("지금 견적과 소켓이 다른 메인보드는 맞지 않는다", () => {
    const build: Build = { cpu: p("amd-ryzen-7-9800x3d") };
    expect(fitsBuild(build, p("asus-tuf-gaming-b650-plus"))).toBe(true);
    expect(fitsBuild(build, p("asrock-z890-pro-rs"))).toBe(false);
  });

  it("호환 정보가 없는 상품은 언제나 맞다", () => {
    expect(fitsBuild(goodBuild, p("phoenix-keyboard"))).toBe(true);
  });
});

describe("전원 커넥터와 그래픽카드 두께", () => {
  it("12V-2x6 그래픽카드에 단자가 없는 파워면 변환 케이블을 알려 준다", () => {
    const issues = checkBuild({ ...goodBuild, psu: p("micronics-classic-ii-600") });
    expect(issues).toContainEqual(expect.objectContaining({ level: "warning", parts: ["gpu", "psu"] }));
    expect(checkBuild(goodBuild).some((i) => i.parts.join() === "gpu,psu")).toBe(false);
  });

  it("케이스가 받는 슬롯보다 두꺼운 그래픽카드는 오류", () => {
    const thinCase = { ...p("antec-torque"), compat: { ...goodBuild.case!.compat!, maxGpuSlots: 2 } } as typeof goodBuild.case;
    expect(checkBuild({ ...goodBuild, case: thinCase }).some((i) => i.parts.join() === "gpu,case" && i.message.includes("슬롯"))).toBe(true);
  });
});
