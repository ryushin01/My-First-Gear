"use client";

import Link from "next/link";
import { useState } from "react";
import { COMPARE_MAX, toggleCompare, useCompareList } from "@/entities/product";

/** 비교 목록에 담기 (상태는 aria-pressed로 알린다) */
export function CompareButton({ slug, name }: { slug: string; name: string }) {
  const list = useCompareList();
  const on = list.includes(slug);
  const [message, setMessage] = useState("");
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        aria-pressed={on}
        onClick={() => {
          if (toggleCompare(slug)) setMessage(on ? "비교 목록에서 뺐습니다." : `${name}을(를) 비교 목록에 담았습니다.`);
          else setMessage(`비교는 ${COMPARE_MAX}개까지 할 수 있습니다. 비교 화면에서 하나를 빼 주세요.`);
        }}
        className="min-h-11 rounded-md border border-white/30 px-4 text-sm hover:border-white aria-pressed:border-cream aria-pressed:bg-cream aria-pressed:text-ink"
      >
        비교 담기
      </button>
      {list.length > 0 && (
        <Link href="/compare" className="inline-flex min-h-11 items-center text-sm underline">
          비교하기 ({list.length})
        </Link>
      )}
      <p role="status" className="w-full text-sm text-mute-100">
        {message}
      </p>
    </div>
  );
}
