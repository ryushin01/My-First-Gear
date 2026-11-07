import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

type BaseProps = {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
};

const inputClass =
  "min-h-11 w-full rounded-md border border-white/20 bg-black/30 px-3 text-cream placeholder:text-mute-200/70 aria-[invalid=true]:border-brand";

function describedBy(id: string, hint?: ReactNode, error?: string) {
  return [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
}

function FieldShell({ id, label, hint, error, required, children }: BaseProps & { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm">
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
        <p id={`${id}-hint`} className="text-xs text-mute-200">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm text-brand">
          {error}
        </p>
      )}
    </div>
  );
}

/** 레이블, 도움말, 오류 메시지를 입력 상자와 연결한 필드 (KWCAG 7.3.1, 7.3.2) */
export function TextField({ id, label, hint, error, required, ...props }: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      <input
        id={id}
        name={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={inputClass}
        {...props}
      />
    </FieldShell>
  );
}

export function TextAreaField({
  id,
  label,
  hint,
  error,
  required,
  ...props
}: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      <textarea
        id={id}
        name={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={`${inputClass} min-h-28 py-2`}
        {...props}
      />
    </FieldShell>
  );
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
            <a href={`#${field}`} className="underline">
              {message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
