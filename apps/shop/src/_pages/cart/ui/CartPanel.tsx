"use client";

import Link from "next/link";
import { useId } from "react";
import { FREE_SHIPPING_FROM, formatPrice } from "@mfg/catalog";
import { GearArt } from "@mfg/gear-art";
import { removeFromCart, setQuantity, useCartSummary } from "@/entities/cart";
import { cartCompat } from "../model/cartCompat";
import { CartCompatNotice } from "./CartCompatNotice";

export function CartPanel() {
  const { lines, subtotal, shipping, total } = useCartSummary();
  const summaryId = useId();

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="mono-label">[No signal]</p>
        <p className="text-mute-100">장바구니가 비어 있습니다.</p>
        <Link href="/gear" className="inline-flex min-h-11 items-center rounded-md bg-cream px-5 text-ink hover:bg-white">
          기어 둘러보기
        </Link>
      </div>
    );
  }

  const compat = cartCompat(lines.flatMap((line) => (line.product ? [line.product] : [])));

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex flex-col gap-4">
        <CartCompatNotice compat={compat} />
        <ul className="flex flex-col gap-2">
          {lines.map((line) => {
            const qtyId = `qty-${line.id}`;
            const max = line.kind === "service" ? 1 : Math.max(1, line.stock ?? 1);
            return (
              <li
                key={line.id}
                className="grid grid-cols-[64px_1fr] items-center gap-4 rounded-lg border border-white/10 p-3 sm:grid-cols-[64px_1fr_auto_auto]"
              >
                <div className="grid size-16 place-items-center rounded-md bg-black/40 text-cream">
                  {line.product ? (
                    <GearArt art={line.product.art} className="size-14" />
                  ) : (
                    <span className="font-mono text-[11px] text-label">SVC</span>
                  )}
                </div>
                <div className="flex min-w-0 flex-col">
                  {line.slug ? (
                    <Link href={`/product/${line.slug}`} className="hover:underline">
                      {line.name}
                    </Link>
                  ) : (
                    <span>{line.name}</span>
                  )}
                  <span className="font-mono text-sm tabular-nums text-mute-200">{formatPrice(line.price)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor={qtyId} className="text-sm text-mute-200">
                    수량
                  </label>
                  <input
                    id={qtyId}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={max}
                    value={line.quantity}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      if (Number.isFinite(value) && value >= 1) setQuantity(line.id, Math.min(value, max));
                    }}
                    className="min-h-11 w-16 rounded-md border border-white/20 bg-black/30 px-2 text-center tabular-nums"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <span className="font-mono tabular-nums">{formatPrice(line.price * line.quantity)}</span>
                  <button type="button" onClick={() => removeFromCart(line.id)} className="min-h-11 px-2 text-sm text-mute-200 hover:text-cream">
                    삭제<span className="sr-only">: {line.name}</span>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <aside aria-labelledby={summaryId} className="flex flex-col gap-4 lg:sticky lg:top-40 lg:self-start">
        <h2 id={summaryId} className="mono-label">
          [Total]
        </h2>
        <dl className="grid grid-cols-[1fr_auto] gap-y-2 font-mono text-sm tabular-nums">
          <dt className="text-mute-200">상품 합계</dt>
          <dd>{formatPrice(subtotal)}</dd>
          <dt className="text-mute-200">배송비</dt>
          <dd>{shipping === 0 ? "무료" : formatPrice(shipping)}</dd>
          <dt className="border-t border-white/10 pt-2">결제 예정 금액</dt>
          <dd className="border-t border-white/10 pt-2 text-lg">{formatPrice(total)}</dd>
        </dl>
        <p className="text-xs text-mute-200">{formatPrice(FREE_SHIPPING_FROM)} 이상 주문하면 배송비가 무료입니다.</p>
        <Link
          href="/checkout"
          className="inline-flex min-h-12 items-center justify-center rounded-md bg-cream px-6 font-medium text-ink hover:bg-white"
        >
          주문하기
        </Link>
      </aside>
    </div>
  );
}
