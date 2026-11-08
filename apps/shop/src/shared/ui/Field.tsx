"use client";

import { useId, type InputHTMLAttributes, type MouseEvent, type ReactNode, type TextareaHTMLAttributes } from "react";

type BaseProps = {
  /** 폼 필드 이름. 화면에 쓰는 id는 useId로 따로 만든다. */
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
};

const inputClass =
  "min-h-11 w-full rounded-md border border-white/20 bg-black/30 px-3 text-cream placeholder:text-mute-200/70 aria-[invalid=true]:border-brand";

/**
 * Cache Components는 이전 화면을 숨긴 채 DOM에 남긴다.
 * 고정 id를 쓰면 숨은 화면의 입력과 겹쳐 레이블이 엉뚱한 칸에 연결되므로 useId로 고유 id를 만든다.
 */
function useFieldIds(name: string, hint?: ReactNode, error?: string) {
  const base = `${useId()}${name}`;
  const hintId = `${base}-hint`;
  const errorId = `${base}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;
  return { inputId: base, hintId, errorId, describedBy };
}

function FieldShell({
  inputId,
  hintId,
  errorId,
  label,
  hint,
  error,
  required,
  children,
}: Omit<BaseProps, "id"> & { inputId: string; hintId: string; errorId: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm">
        {label}
        {required ? (
          <span className="ml-1 text-brand" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="ml-1 text-xs text-mute-200">(선택)</span>
        )}
      </label>
      {children}
      {hint && (
        <p id={hintId} className="text-xs text-mute-200">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-brand">
          {error}
        </p>
      )}
    </div>
  );
}

/** 레이블, 도움말, 오류 메시지를 입력 상자와 연결한 필드 (KWCAG 7.3.1, 7.3.2) */
export function TextField({ id, label, hint, error, required, ...props }: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  const ids = useFieldIds(id, hint, error);
  return (
    <FieldShell {...ids} label={label} hint={hint} error={error} required={required}>
      <input
        id={ids.inputId}
        name={id}
        required={required}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={ids.describedBy}
        className={inputClass}
        {...props}
      />
    </FieldShell>
  );
}

export function TextAreaField({ id, label, hint, error, required, ...props }: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ids = useFieldIds(id, hint, error);
  return (
    <FieldShell {...ids} label={label} hint={hint} error={error} required={required}>
      <textarea
        id={ids.inputId}
        name={id}
        required={required}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={ids.describedBy}
        className={`${inputClass} min-h-28 py-2`}
        {...props}
      />
    </FieldShell>
  );
}

/** 오류 요약 링크: 같은 폼 안에서 이름이 같은 칸으로 초점을 옮긴다. */
function focusField(event: MouseEvent<HTMLAnchorElement>, name: string) {
  const form = event.currentTarget.closest("form");
  const field = form?.querySelector<HTMLElement>(`[name="${CSS.escape(name)}"]`);
  if (!field) return;
  event.preventDefault();
  field.focus();
}

/** 제출 실패 시 초점을 받는 오류 요약 */
export function ErrorSummary({ errors, titleId }: { errors: Record<string, string>; titleId: string }) {
  const entries = Object.entries(errors);
  if (entries.length === 0) return null;
  return (
    <div role="alert" tabIndex={-1} aria-labelledby={titleId} className="error-summary rounded-md border border-brand/60 p-4">
      <p id={titleId} className="font-medium text-brand">
        입력 내용을 확인해 주세요. ({entries.length}건)
      </p>
      <ul className="mt-2 list-disc pl-5 text-sm">
        {entries.map(([field, message]) => (
          <li key={field}>
            <a href={`#${field}`} onClick={(event) => focusField(event, field)} className="underline">
              {message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
