"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import { useActionFormLock } from "@/shared/lib";
import { ErrorSummary, TextAreaField, TextField } from "@/shared/ui";
import { createInquiryAction } from "../api/inquiryActions";
import { inquiryCategoryLabel } from "../model/inquiryLabels";

export function InquiryForm() {
  const [state, action, pending] = useActionState(createInquiryAction, null);
  const guardSubmit = useActionFormLock(state);
  const formRef = useRef<HTMLFormElement>(null);
  const titleId = useId();
  const categoryId = `${useId()}category`;
  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
    else if (state) formRef.current?.querySelector<HTMLElement>(".error-summary")?.focus();
  }, [state]);

  return (
    <form ref={formRef} action={action} onSubmit={guardSubmit} noValidate className="flex max-w-xl flex-col gap-4">
      {state?.errors && <ErrorSummary errors={state.errors} titleId={titleId} />}
      <div className="flex flex-col gap-1.5">
        <label htmlFor={categoryId} className="text-sm">
          문의 유형
          <span className="ml-1 text-brand" aria-hidden="true">
            *
          </span>
        </label>
        <select
          id={categoryId}
          name="category"
          required
          key={state?.values?.category ?? ""}
          defaultValue={state?.values?.category ?? ""}
          aria-invalid={state?.errors?.category ? true : undefined}
          aria-describedby={state?.errors?.category ? `${categoryId}-error` : undefined}
          className="min-h-11 rounded-md border border-white/20 bg-ink px-3 text-cream aria-[invalid=true]:border-brand"
        >
          <option value="" disabled>
            골라 주세요
          </option>
          {Object.entries(inquiryCategoryLabel).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {state?.errors?.category && (
          <p id={`${categoryId}-error`} className="text-sm text-brand">
            {state.errors.category}
          </p>
        )}
      </div>
      <TextField id="title" label="제목" maxLength={80} required defaultValue={state?.values?.title} error={state?.errors?.title} />
      <TextAreaField id="body" label="문의 내용" maxLength={2000} required defaultValue={state?.values?.body} error={state?.errors?.body} />
      <button
        type="submit"
        disabled={pending}
        className="min-h-12 w-fit rounded-md bg-cream px-6 font-medium text-ink hover:bg-white disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "접수 중…" : "문의 접수"}
      </button>
      <p role="status" className="min-h-5 text-sm text-[#3cb371]">
        {state?.ok ? state.message : ""}
      </p>
    </form>
  );
}
