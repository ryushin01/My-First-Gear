"use client";

import Link from "next/link";
import { useId, useRef, useState, type FormEvent } from "react";
import { formatPrice } from "@mfg/catalog";
import { clearCart, useCartSummary } from "@/entities/cart";
import { orderStatusLabel, paymentMethods, placeOrderAction, type OrderSummary, type PaymentMethod } from "@/entities/order";
import { EMAIL_PATTERN, PHONE_PATTERN, validate } from "@/shared/lib";
import { ErrorSummary, TextAreaField, TextField } from "@/shared/ui";

const rules = {
  name: { required: "받는 분 이름을 입력해 주세요." },
  phone: {
    required: "휴대폰 번호를 입력해 주세요.",
    pattern: [PHONE_PATTERN, "휴대폰 번호를 010-1234-5678 형식으로 입력해 주세요."] as [RegExp, string],
  },
  email: { pattern: [EMAIL_PATTERN, "이메일 주소 형식이 아닙니다. 예: gear@example.com"] as [RegExp, string] },
  address: { required: "배송 주소를 입력해 주세요." },
};

export function CheckoutForm() {
  const { lines, shipping, total } = useCartSummary();
  const [done, setDone] = useState<OrderSummary | null>(null);
  const [serverError, setServerError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [payment, setPayment] = useState<PaymentMethod>("card");
  const summaryRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  if (done) {
    return (
      <div role="status" className="flex flex-col gap-6">
        <p className="font-display text-4xl">주문이 접수되었습니다.</p>
        <p className="text-mute-100">주문 번호와 받는 분 이름으로 언제든 조회할 수 있습니다.</p>
        <dl className="grid max-w-xl grid-cols-[auto_1fr] gap-x-6 gap-y-2 font-mono text-sm">
          <dt className="text-label">[Order no.]</dt>
          <dd className="text-cream">{done.id}</dd>
          <dt className="text-label">[Status]</dt>
          <dd>{orderStatusLabel[done.status]}</dd>
          <dt className="text-label">[Total]</dt>
          <dd className="tabular-nums">{formatPrice(done.total)}</dd>
        </dl>
        <div className="flex flex-wrap gap-3">
          <Link href="/orders" className="inline-flex min-h-11 items-center rounded-md border border-white/30 px-5 hover:border-white">
            주문 조회
          </Link>
          <Link href="/gear" className="inline-flex min-h-11 items-center rounded-md bg-cream px-5 text-ink hover:bg-white">
            계속 둘러보기
          </Link>
        </div>
      </div>
    );
  }

  if (lines.length === 0 && !submitting) {
    return (
      <p className="py-16 text-center text-mute-100">
        주문할 상품이 없습니다.{" "}
        <Link href="/gear" className="underline">
          기어 둘러보기
        </Link>
      </p>
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return; // 중복 제출 방지
    const data = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
    const found = validate(data, rules);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      requestAnimationFrame(() => summaryRef.current?.querySelector<HTMLElement>(".error-summary")?.focus());
      return;
    }

    setSubmitting(true);
    setServerError("");
    const result = await placeOrderAction({
      lines: lines.map(({ id, quantity }) => ({ itemId: id, quantity })),
      buyer: {
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: (data.email ?? "").trim(),
        address: data.address.trim(),
        memo: (data.memo ?? "").trim(),
      },
      payment,
    });
    setSubmitting(false);
    if (!result.ok) {
      setServerError(result.message);
      return;
    }
    clearCart();
    setDone(result.data);
    window.scrollTo({ top: 0 });
  }

  return (
    <form noValidate onSubmit={onSubmit} className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex flex-col gap-6">
        <div ref={summaryRef}>
          <ErrorSummary errors={errors} titleId={titleId} />
          {serverError && (
            <p role="alert" className="rounded-md border border-brand/60 p-4 text-brand">
              {serverError}
            </p>
          )}
        </div>
        <fieldset className="flex flex-col gap-4">
          <legend className="mono-label mb-3">[Shipping]</legend>
          <TextField id="name" label="받는 분" autoComplete="name" required error={errors.name} />
          <TextField
            id="phone"
            label="휴대폰 번호"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="010-1234-5678"
            required
            error={errors.phone}
          />
          <TextField id="email" label="이메일" type="email" autoComplete="email" hint="주문 안내를 받을 주소입니다." error={errors.email} />
          <TextField id="address" label="배송 주소" autoComplete="street-address" required error={errors.address} />
          <TextAreaField id="memo" label="배송 메모" maxLength={200} />
        </fieldset>
        <fieldset className="flex flex-col gap-2">
          <legend className="mono-label mb-3">[Payment]</legend>
          {paymentMethods.map((method) => (
            <label key={method.value} className="inline-flex min-h-8 cursor-pointer items-center gap-3">
              <input
                type="radio"
                name="payment"
                value={method.value}
                checked={payment === method.value}
                onChange={() => setPayment(method.value)}
                className="size-4 accent-[#ff3131]"
              />
              {method.label}
            </label>
          ))}
          <p className="text-xs text-mute-200">포트폴리오 데모라 실제 결제는 일어나지 않습니다. 카드 번호도 받지 않습니다.</p>
        </fieldset>
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-40 lg:self-start" aria-label="주문 요약">
        <ul className="flex flex-col gap-1 text-sm">
          {lines.map((line) => (
            <li key={line.id} className="flex justify-between gap-3">
              <span className="min-w-0 text-mute-100">
                {line.name} × {line.quantity}
              </span>
              <span className="shrink-0 font-mono tabular-nums">{formatPrice(line.price * line.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="grid grid-cols-[1fr_auto] gap-y-2 border-t border-white/10 pt-3 font-mono text-sm tabular-nums">
          <dt className="text-mute-200">배송비</dt>
          <dd>{shipping === 0 ? "무료" : formatPrice(shipping)}</dd>
          <dt>결제 금액</dt>
          <dd className="text-lg">{formatPrice(total)}</dd>
        </dl>
        <button
          type="submit"
          disabled={submitting}
          aria-disabled={submitting}
          className="min-h-12 rounded-md bg-cream px-6 font-medium text-ink hover:bg-white disabled:cursor-wait disabled:opacity-60"
        >
          {submitting ? "결제 처리 중…" : `${formatPrice(total)} 결제하기`}
        </button>
      </aside>
    </form>
  );
}
