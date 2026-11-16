import { unstable_rethrow } from "next/navigation";

/**
 * 폼 액션에서 예상하지 못한 오류(DB 연결 끊김 등)를 실패 상태로 바꾼다. 서버 로그에는 label과 함께 남긴다.
 * 그대로 던지면 화면 전체가 오류 화면으로 바뀌므로, 입력값을 돌려주는 실패 상태(onFail)로 응답한다.
 * Next의 redirect()·notFound() 신호는 그대로 던진다.
 */
export async function guardAction<T>(label: string, run: () => Promise<T>, onFail: () => T): Promise<T> {
  try {
    return await run();
  } catch (error) {
    unstable_rethrow(error);
    console.error(`[${label}]`, error);
    return onFail();
  }
}
