"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

/** 제출 중에는 눌리지 않는 버튼 (중복 제출 방지) */
export function SubmitButton({ children, className = "is-primary", form }: { children: ReactNode; className?: string; form?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" form={form} className={`button ${className} ${pending ? "is-loading" : ""}`} disabled={pending} aria-disabled={pending}>
      {children}
    </button>
  );
}
