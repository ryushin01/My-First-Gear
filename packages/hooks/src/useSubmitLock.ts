"use client";

import { useEffect, useRef, type FormEvent } from "react";

/**
 * 중복 제출 잠금. 상태(isPending 등)는 다음 렌더에야 바뀌어 빠른 연속 클릭을 못 막으므로 ref로 잠근다.
 * - tryLock(): 잠겨 있지 않으면 잠그고 true
 * - release(): 잠금 해제 (실패했을 때, 또는 다시 제출할 수 있어야 할 때)
 */
export function useSubmitLock() {
  const locked = useRef(false);
  return {
    tryLock() {
      if (locked.current) return false;
      locked.current = true;
      return true;
    },
    release() {
      locked.current = false;
    },
  };
}

/**
 * form action(useActionState)용 잠금. 제출이 진행 중이면 다음 제출을 막고, 결과가 오면 푼다.
 * keepLockedOnSuccess: 성공 뒤 화면을 떠나는 폼은 성공했을 때 잠금을 유지한다.
 */
export function useActionFormLock<S extends { ok: boolean } | null>(state: S, keepLockedOnSuccess = false) {
  const lock = useSubmitLock();
  useEffect(() => {
    if (!state) return;
    if (state.ok && keepLockedOnSuccess) return;
    lock.release();
    // lock은 렌더마다 새 객체지만 같은 ref를 쓴다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, keepLockedOnSuccess]);
  return (event: FormEvent<HTMLFormElement>) => {
    if (!lock.tryLock()) event.preventDefault();
  };
}
