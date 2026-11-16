/** 서버 액션이 던지거나(서버 오류) 요청이 닿지 않았을 때(네트워크 끊김 등) 보여 주는 안내 */
export const ACTION_FAILED_MESSAGE = "요청을 처리하지 못했습니다. 연결을 확인하고 잠시 후 다시 시도해 주세요.";

export type ActionFailure = { ok: false; message: string };

/** Next의 redirect()·notFound()가 던지는 신호. 실패로 바꾸지 않고 그대로 던져 Next가 처리하게 한다. */
function isNavigationSignal(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("digest" in error)) return false;
  const { digest } = error as { digest: unknown };
  return typeof digest === "string" && /^NEXT_(REDIRECT|HTTP_ERROR_FALLBACK|NOT_FOUND)/.test(digest);
}

/**
 * 서버 액션을 직접 부를 때 쓴다. 액션이 던지거나 요청이 실패하면 onFail의 값(기본: ActionFailure)을 돌려준다.
 * 그대로 두면 await가 던져 잠금·진행 상태가 풀리지 않고, 전환(startTransition) 안에서는 오류 경계까지 올라간다.
 *
 * 폼 액션(useActionState)은 감싸지 않는다. 서버 액션을 그대로 넘겨야 JS를 받기 전에도 제출되므로,
 * 폼 액션은 서버에서 예외를 잡아 실패 상태로 돌려준다.
 */
export async function callAction<T>(run: () => Promise<T>): Promise<T | ActionFailure>;
export async function callAction<T, F>(run: () => Promise<T>, onFail: (error: unknown) => F): Promise<T | F>;
export async function callAction<T, F>(run: () => Promise<T>, onFail?: (error: unknown) => F): Promise<T | F | ActionFailure> {
  try {
    return await run();
  } catch (error) {
    if (isNavigationSignal(error)) throw error;
    console.error("[action]", error);
    return onFail ? onFail(error) : { ok: false, message: ACTION_FAILED_MESSAGE };
  }
}
