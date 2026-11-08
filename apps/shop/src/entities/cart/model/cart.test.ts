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
