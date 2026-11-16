"use client";

import { useState, useTransition } from "react";
import { addToCart } from "@/entities/cart";
import { useMemberName } from "@/entities/member";
import { callAction, useSubmitLock } from "@/shared/lib";
import { toggleRestockAction } from "../api/actions";
import { decreaseRestockedCount } from "../model/restockNotice";

/**
 * 마이페이지 재입고 목록에서 다시 들어온 상품을 바로 담는다. 담으면 그 상품의 재입고 알림을 마쳐 머리글 알림도 줄인다.
 * 알림을 지우지 못해도(연결 끊김) 장바구니에는 담는다.
 */
export function RestockCartButton({ productId, productName }: { productId: string; productName: string }) {
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const lock = useSubmitLock();
  const member = useMemberName();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        disabled={pending || done}
        onClick={() => {
          if (!lock.tryLock()) return;
          const by = member; // 응답을 기다리는 사이 다른 회원으로 바뀌면 그 회원의 알림 수를 줄이지 않는다
          addToCart(productId);
          startTransition(async () => {
            const result = await callAction(() => toggleRestockAction(productId, false));
            setDone(true);
            if (result.ok) decreaseRestockedCount(by);
            setMessage(result.ok ? `${productName}을(를) 장바구니에 담고 재입고 알림을 마쳤습니다.` : `${productName}을(를) 장바구니에 담았습니다.`);
          });
        }}
        className="min-h-11 rounded-md border border-white/30 px-4 text-sm hover:border-white disabled:opacity-60"
      >
        장바구니 담기<span className="sr-only">: {productName}</span>
      </button>
      <p role="status" className="text-sm text-mute-100">
        {message}
      </p>
    </div>
  );
}
