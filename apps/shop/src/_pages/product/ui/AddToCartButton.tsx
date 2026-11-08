"use client";

import { useState } from "react";
import { addToCart } from "@/entities/cart";

type AddToCartButtonProps = { productId: string; productName: string; disabled?: boolean };

export function AddToCartButton({ productId, productName, disabled }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          addToCart(productId);
          setAdded(true);
        }}
        className="min-h-12 rounded-md bg-cream px-6 font-medium text-ink transition-colors hover:bg-white disabled:cursor-not-allowed disabled:bg-mute-200/40 disabled:text-ink/70"
      >
        {disabled ? "품절" : "장바구니 담기"}
      </button>
      <p role="status" className="min-h-5 text-sm text-mute-100">
        {added && `${productName}을(를) 장바구니에 담았습니다.`}
      </p>
    </div>
  );
}
