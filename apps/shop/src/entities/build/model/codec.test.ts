import { describe, expect, it } from "vitest";
import { decodeBuild, encodeBuild } from "./codec";

describe("견적 주소 인코딩", () => {
  it("부품과 조립 서비스를 주소 문자열로 주고받는다", () => {
    const state = { parts: { cpu: "p-cpu-001", gpu: "p-gpu-001" }, services: ["svc-assembly", "svc-os"] };
    expect(decodeBuild(encodeBuild(state))).toEqual(state);
  });

  it("없는 상품이나 칸에 맞지 않는 상품은 버린다", () => {
    expect(decodeBuild("cpu:p-gpu-001,gpu:p-nope-999|")).toBeNull();
    expect(decodeBuild("cpu:p-cpu-001,gpu:p-cpu-002|")).toEqual({ parts: { cpu: "p-cpu-001" }, services: [] });
  });
});
