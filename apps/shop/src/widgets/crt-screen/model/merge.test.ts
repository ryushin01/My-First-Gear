import { describe, expect, it } from "vitest";
import { mergeBuild, mergeCart } from "./merge";

describe("회원 장바구니·견적 합치기", () => {
  it("장바구니는 상품별로 많은 수량을 쓴다", () => {
    expect(
      mergeCart(
        [{ productId: "a", quantity: 1 }, { productId: "b", quantity: 3 }],
        [{ productId: "a", quantity: 2 }, { productId: "c", quantity: 1 }],
      ),
    ).toEqual([
      { productId: "a", quantity: 2 },
      { productId: "c", quantity: 1 },
      { productId: "b", quantity: 3 },
    ]);
  });

  it("견적은 이 기기에 부품이 있으면 그대로, 비어 있으면 서버 것을 쓴다", () => {
    const remote = { parts: { cpu: "p-cpu-001" }, services: [] };
    expect(mergeBuild({ parts: {}, services: ["svc-assembly"] }, remote)).toBe(remote);
    const local = { parts: { gpu: "p-gpu-001" }, services: [] };
    expect(mergeBuild(local, remote)).toBe(local);
  });
});
