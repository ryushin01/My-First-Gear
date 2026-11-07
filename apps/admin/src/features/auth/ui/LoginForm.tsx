"use client";

import { useActionState } from "react";
import { ActionMessage, SubmitButton } from "@/shared/ui";
import { loginAction } from "../api/actions";

export function LoginForm({ next, hint }: { next: string; hint: string | null }) {
  const [state, action] = useActionState(loginAction, null);
  return (
    <form action={action} className="box">
      <input type="hidden" name="next" value={next} />
      <div className="field">
        <label className="label" htmlFor="password">
          비밀번호
        </label>
        <div className="control">
          <input
            id="password"
            name="password"
            type="password"
            className={`input ${state && !state.ok ? "is-danger" : ""}`}
            autoComplete="current-password"
            required
            aria-invalid={state && !state.ok ? true : undefined}
            aria-describedby={hint ? "password-hint" : undefined}
          />
        </div>
        {hint && (
          <p id="password-hint" className="help">
            포트폴리오 데모 비밀번호: <code>{hint}</code>
          </p>
        )}
        <ActionMessage state={state} />
      </div>
      <SubmitButton className="is-dark is-fullwidth">로그인</SubmitButton>
    </form>
  );
}
