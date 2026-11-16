import { describe, expect, it } from "vitest";
import { parseBuildState, sameBuild } from "./build";

describe("저장된 견적 정리", () => {
  it("객체가 아니면 빈 견적으로 시작한다", () => {
    expect(parseBuildState(null)).toBeNull();
    expect(parseBuildState([])).toBeNull();
    expect(parseBuildState("cpu")).toBeNull();
  });

  it("모르는 칸과 문자열이 아닌 값은 빼고, 서비스가 배열이 아니면 기본 조립으로 둔다", () => {
    expect(parseBuildState({ parts: { cpu: "p-cpu-001", gpu: 3, fan: "p-x" }, services: ["svc-os", 1] })).toEqual({
      parts: { cpu: "p-cpu-001" },
      services: ["svc-os"],
    });
    expect(parseBuildState({ parts: null })).toEqual({ parts: {}, services: ["svc-assembly"] });
  });
});

describe("견적 비교", () => {
  it("칸을 고른 순서와 서비스 순서가 달라도 같은 견적으로 본다", () => {
    const a = { parts: { cpu: "p-cpu-001", gpu: "p-gpu-001" }, services: ["svc-assembly", "svc-os"] };
    const b = { parts: { gpu: "p-gpu-001", cpu: "p-cpu-001" }, services: ["svc-os", "svc-assembly"] };
    expect(sameBuild(a, b)).toBe(true);
  });

  it("부품이나 서비스가 하나라도 다르면 다른 견적이다", () => {
    const a = { parts: { cpu: "p-cpu-001" }, services: ["svc-assembly"] };
    expect(sameBuild(a, { parts: { cpu: "p-cpu-002" }, services: ["svc-assembly"] })).toBe(false);
    expect(sameBuild(a, { parts: { cpu: "p-cpu-001", gpu: "p-gpu-001" }, services: ["svc-assembly"] })).toBe(false);
    expect(sameBuild(a, { parts: { cpu: "p-cpu-001" }, services: [] })).toBe(false);
  });
});
