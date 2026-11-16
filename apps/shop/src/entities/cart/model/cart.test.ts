import { describe, expect, it } from "vitest";
import { addToCart, clearCart, setQuantity } from "./cart";

function stored() {
  return JSON.parse(window.localStorage.getItem("mfg:cart") ?? "[]");
}

describe("장바구니", () => {
  it("같은 상품은 수량을 늘리고, 조립 서비스는 한 번만 담는다", () => {
    clearCart();
    addToCart("p-ssd-001");
    addToCart("p-ssd-001");
    addToCart("svc-assembly");
    addToCart("svc-assembly");
    expect(stored()).toEqual([
      { productId: "p-ssd-001", quantity: 2 },
      { productId: "svc-assembly", quantity: 1 },
    ]);
    setQuantity("p-ssd-001", 0);
    expect(stored()).toEqual([{ productId: "svc-assembly", quantity: 1 }]);
  });
});

describe("저장된 장바구니 정리", () => {
  it("배열이 아니면 빈 장바구니로 시작한다", async () => {
    const { parseCart } = await import("./cart");
    expect(parseCart({})).toBeNull();
    expect(parseCart("x")).toBeNull();
  });

  it("모양이 다른 줄은 빼고, 같은 상품은 첫 줄만, 수량은 99개까지", async () => {
    const { parseCart } = await import("./cart");
    expect(
      parseCart([
        { productId: "p-ssd-001", quantity: 2 },
        { productId: "p-ssd-001", quantity: 5 },
        { productId: "", quantity: 1 },
        { productId: "p-cpu-001", quantity: 0 },
        { productId: "p-gpu-001", quantity: 1.5 },
        null,
        "p-mem-001",
        { productId: "p-mem-001", quantity: 500 },
      ]),
    ).toEqual([
      { productId: "p-ssd-001", quantity: 2 },
      { productId: "p-mem-001", quantity: 99 },
    ]);
  });
});
