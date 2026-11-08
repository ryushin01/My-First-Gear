"use client";

import { useSyncExternalStore } from "react";
import { MEMBER_COOKIE } from "./cookie";

const EVENT = "mfg:member";

function read(): string | null {
  const match = document.cookie.split("; ").find((part) => part.startsWith(`${MEMBER_COOKIE}=`));
  if (!match) return null;
  try {
    return decodeURIComponent(decodeURIComponent(match.slice(MEMBER_COOKIE.length + 1))) || null;
  } catch {
    return null;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("focus", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("focus", onChange);
  };
}

/** 로그인한 회원 이름. 로그인 전이거나 서버 렌더링 중이면 null */
export function useMemberName(): string | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

/** 로그인·로그아웃 뒤 화면의 회원 표시를 갱신한다. */
export function notifyMemberChanged() {
  window.dispatchEvent(new Event(EVENT));
}
