"use client";

import Link from "next/link";
import { useActionState, useEffect, useId, useRef } from "react";
import { notifyMemberChanged } from "@/entities/member";
import { useActionFormLock } from "@/shared/lib";
import { ErrorSummary, TextField } from "@/shared/ui";
import { loginAction, logoutAction, signupAction, type AuthState } from "../api/actions";

/** 클라이언트 상태를 모두 버리는 전체 페이지 이동 (로그인 상태가 바뀔 때만 쓴다) */
function hardNavigate(path: string) {
  window.location.href = new URL(path, window.location.origin).href;
}

/**
 * 로그인 상태가 바뀌면 전체 페이지를 다시 불러온다.
 * Cache Components는 이전 화면을 숨겨 두었다가 다시 보여 주므로, 로그인 전 화면이 남지 않게 한다.
 */
function useAfterAuth(state: AuthState) {
  const summaryRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      notifyMemberChanged();
      hardNavigate(state.next ?? "/my");
    } else {
      summaryRef.current?.querySelector<HTMLElement>(".error-summary, [role=alert]")?.focus();
    }
  }, [state]);
  return summaryRef;
}

function Feedback({ state, titleId }: { state: AuthState; titleId: string }) {
  if (!state || state.ok) return null;
  if (state.errors && Object.keys(state.errors).length) return <ErrorSummary errors={state.errors} titleId={titleId} />;
  return (
    <p role="alert" tabIndex={-1} className="rounded-md border border-brand/60 p-4 text-brand">
      {state.message}
    </p>
  );
}

const submitClass =
  "min-h-12 rounded-md bg-cream px-6 font-medium text-ink hover:bg-white disabled:cursor-wait disabled:opacity-60";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(loginAction, null);
  const guardSubmit = useActionFormLock(state, true); // 성공하면 화면을 떠나므로 잠금 유지
  const ref = useAfterAuth(state);
  const titleId = useId();
  return (
    <form action={action} onSubmit={guardSubmit} noValidate className="flex max-w-md flex-col gap-4">
      <div ref={ref}>
        <Feedback state={state} titleId={titleId} />
      </div>
      <input type="hidden" name="next" value={next} />
      <TextField id="email" label="이메일" type="email" autoComplete="email" required defaultValue={state?.values?.email} error={state?.errors?.email} />
      <TextField id="password" label="비밀번호" type="password" autoComplete="current-password" required error={state?.errors?.password} />
      <p className="text-sm text-mute-200">
        데모 계정: <code className="font-mono text-cream">demo@myfirstgear.dev</code> / <code className="font-mono text-cream">demo1234</code>
      </p>
      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? "로그인 중…" : "로그인"}
      </button>
      <p className="text-sm text-mute-100">
        처음이신가요?{" "}
        <Link href={`/signup?next=${encodeURIComponent(next)}`} className="underline">
          회원 가입
        </Link>
      </p>
    </form>
  );
}

export function SignupForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signupAction, null);
  const guardSubmit = useActionFormLock(state, true);
  const ref = useAfterAuth(state);
  const titleId = useId();
  const agreeError = `${useId()}agree-error`;
  return (
    <form action={action} onSubmit={guardSubmit} noValidate className="flex max-w-md flex-col gap-4">
      <div ref={ref}>
        <Feedback state={state} titleId={titleId} />
      </div>
      <input type="hidden" name="next" value={next} />
      <TextField id="name" label="이름" autoComplete="name" maxLength={20} required defaultValue={state?.values?.name} error={state?.errors?.name} />
      <TextField id="email" label="이메일" type="email" autoComplete="email" required defaultValue={state?.values?.email} error={state?.errors?.email} />
      <TextField
        id="password"
        label="비밀번호"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
        hint="8자 이상으로 입력해 주세요."
        error={state?.errors?.password}
      />
      <div className="flex flex-col gap-1.5">
        <label className="inline-flex cursor-pointer items-start gap-3 text-sm">
          <input
            name="agree"
            type="checkbox"
            defaultChecked={state?.values?.agree === "on"}
            className="mt-0.5 size-4 accent-[#ff3131]"
            aria-invalid={state?.errors?.agree ? true : undefined}
            aria-describedby={state?.errors?.agree ? agreeError : undefined}
          />
          <span>
            개인정보(이름, 이메일) 수집에 동의합니다. <span className="text-mute-200">포트폴리오 데모라 데이터는 매일 지워집니다.</span>
          </span>
        </label>
        {state?.errors?.agree && (
          <p id={agreeError} className="text-sm text-brand">
            {state.errors.agree}
          </p>
        )}
      </div>
      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? "가입 중…" : "가입하기"}
      </button>
    </form>
  );
}

export function LogoutButton() {
  return (
    <form
      action={async () => {
        await logoutAction();
        notifyMemberChanged();
        hardNavigate("/");
      }}
    >
      <button type="submit" className="min-h-11 rounded-md border border-white/30 px-4 text-sm hover:border-white">
        로그아웃
      </button>
    </form>
  );
}
