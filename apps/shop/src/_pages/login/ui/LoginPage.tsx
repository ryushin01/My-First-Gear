"use client";

import { useSearchParams } from "next/navigation";
import { LoginForm, SignupForm } from "@/features/auth";

/** ?next= 를 읽어 로그인·가입 뒤 돌아갈 곳을 정한다. */
export function AuthFormWithNext({ mode }: { mode: "login" | "signup" }) {
  const next = useSearchParams().get("next") ?? "/my";
  return mode === "login" ? <LoginForm next={next} /> : <SignupForm next={next} />;
}
