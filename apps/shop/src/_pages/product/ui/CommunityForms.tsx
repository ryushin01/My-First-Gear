"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActionState, useEffect, useId, useRef } from "react";
import { useMemberName } from "@/entities/member";
import { useActionFormLock } from "@/shared/lib";
import { createQuestionAction, createReviewAction, type CommunityState } from "../api/communityActions";

function LoginNotice({ what }: { what: string }) {
  const pathname = usePathname();
  return (
    <p className="text-sm text-mute-200">
      <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="text-cream underline">
        로그인
      </Link>
      하면 {what} 남길 수 있습니다.
    </p>
  );
}

function Status({ state }: { state: CommunityState }) {
  return (
    <p role="status" className={`min-h-5 text-sm ${state?.ok ? "text-[#3cb371]" : "text-brand"}`}>
      {state?.message ?? ""}
    </p>
  );
}

const textareaClass = "min-h-24 w-full rounded-md border border-white/20 bg-black/30 px-3 py-2 text-cream aria-[invalid=true]:border-brand";
const buttonClass = "min-h-11 w-fit rounded-md border border-white/30 px-4 text-sm hover:border-white disabled:opacity-60";

export function ReviewForm({ productId }: { productId: string }) {
  const name = useMemberName();
  const [state, action, pending] = useActionState(createReviewAction, null);
  const guardSubmit = useActionFormLock(state);
  const formRef = useRef<HTMLFormElement>(null);
  const id = useId();
  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);
  if (!name) return <LoginNotice what="후기를" />;

  return (
    <form ref={formRef} action={action} onSubmit={guardSubmit} className="flex flex-col gap-3">
      <input type="hidden" name="productId" value={productId} />
      <fieldset aria-invalid={state?.field === "rating" || undefined}>
        <legend className="mb-1 text-sm">별점</legend>
        <div className="flex flex-wrap gap-3">
          {[5, 4, 3, 2, 1].map((n) => (
            <label key={n} className="inline-flex min-h-8 cursor-pointer items-center gap-1.5 text-sm">
              <input type="radio" name="rating" value={n} defaultChecked={state?.values?.rating === String(n)} className="size-4 accent-[#ff3131]" />
              {n}점
            </label>
          ))}
        </div>
      </fieldset>
      <label htmlFor={`${id}-body`} className="text-sm">
        후기 내용
      </label>
      <textarea
        id={`${id}-body`}
        name="body"
        defaultValue={state?.values?.body}
        maxLength={1000}
        className={textareaClass}
        aria-invalid={state?.field === "body" || undefined}
      />
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "등록 중…" : "후기 등록"}
      </button>
      <Status state={state} />
    </form>
  );
}

export function QuestionForm({ productId }: { productId: string }) {
  const name = useMemberName();
  const [state, action, pending] = useActionState(createQuestionAction, null);
  const guardSubmit = useActionFormLock(state);
  const formRef = useRef<HTMLFormElement>(null);
  const id = useId();
  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);
  if (!name) return <LoginNotice what="질문을" />;

  return (
    <form ref={formRef} action={action} onSubmit={guardSubmit} className="flex flex-col gap-3">
      <input type="hidden" name="productId" value={productId} />
      <label htmlFor={`${id}-q`} className="text-sm">
        상품 질문
      </label>
      <textarea
        id={`${id}-q`}
        name="body"
        defaultValue={state?.values?.body}
        maxLength={1000}
        className={textareaClass}
        aria-invalid={state?.field === "body" || undefined}
      />
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "등록 중…" : "질문 등록"}
      </button>
      <Status state={state} />
    </form>
  );
}
