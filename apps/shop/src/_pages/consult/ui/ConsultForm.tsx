"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { formatPrice, type Product } from "@mfg/catalog";
import { createConsultAction } from "@/entities/order";
import { PHONE_PATTERN, useSubmitLock, validate } from "@/shared/lib";
import { ErrorSummary, TextAreaField, TextField } from "@/shared/ui";

const rules = {
  name: { required: "이름을 입력해 주세요." },
  phone: {
    required: "연락받을 휴대폰 번호를 입력해 주세요.",
    pattern: [PHONE_PATTERN, "휴대폰 번호를 010-1234-5678 형식으로 입력해 주세요."] as [RegExp, string],
  },
};

/** 고가 상품 구매 상담 신청 (모의 접수) */
export function ConsultForm({ product }: { product?: Product }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [serverError, setServerError] = useState("");
  const lock = useSubmitLock();
  const wrapRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!lock.tryLock()) return;
    const data = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
    const found = validate(data, rules);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      lock.release();
      requestAnimationFrame(() => wrapRef.current?.querySelector<HTMLElement>(".error-summary")?.focus());
      return;
    }
    setState("sending");
    setServerError("");
    const result = await createConsultAction({
      productSlug: product?.slug ?? null,
      name: data.name ?? "",
      phone: data.phone ?? "",
      preferredDate: data.date ?? "",
      message: data.message ?? "",
    });
    if (!result.ok) {
      lock.release();
      setServerError(result.message);
      setState("idle");
      return;
    }
    setState("done");
  }

  if (state === "done") {
    return (
      <div role="status" className="flex flex-col gap-2 py-10">
        <p className="font-display text-4xl">상담 신청을 받았습니다.</p>
        <p className="text-mute-100">영업일 기준 하루 안에 연락드립니다. (포트폴리오 데모라 실제 연락은 가지 않습니다.)</p>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className="flex max-w-xl flex-col gap-4">
      <div ref={wrapRef}>
        <ErrorSummary errors={errors} titleId={titleId} />
        {serverError && (
          <p role="alert" className="rounded-md border border-brand/60 p-4 text-brand">
            {serverError}
          </p>
        )}
      </div>
      {product && (
        <p className="rounded-md border border-white/10 p-3 text-sm">
          상담 상품: <strong>{product.name}</strong> · <span className="font-mono">{formatPrice(product.price)}</span>
        </p>
      )}
      <TextField id="name" label="이름" autoComplete="name" required error={errors.name} />
      <TextField id="phone" label="휴대폰 번호" type="tel" autoComplete="tel" placeholder="010-1234-5678" required error={errors.phone} />
      <TextField id="date" label="방문 희망일" type="date" />
      <TextAreaField id="message" label="문의 내용" maxLength={500} hint="옵션, 색상, 시승 희망 여부 등을 적어 주세요." />
      <button
        type="submit"
        disabled={state === "sending"}
        className="min-h-12 rounded-md bg-cream px-6 font-medium text-ink hover:bg-white disabled:cursor-wait disabled:opacity-60"
      >
        {state === "sending" ? "보내는 중…" : "상담 신청"}
      </button>
    </form>
  );
}
