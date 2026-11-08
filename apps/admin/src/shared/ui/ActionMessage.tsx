/** values: 실패했을 때 입력값을 되돌려 준다. (React 폼 액션은 제출 뒤 폼을 원래 값으로 되돌리므로 다시 채운다) */
export type ActionState = { ok: boolean; message: string; values?: Record<string, string> } | null;

/** 서버 액션 결과 안내. 화면 읽기 프로그램이 읽도록 role=status를 쓴다. */
export function ActionMessage({ state }: { state: ActionState }) {
  return (
    <p role="status" className={`help ${state ? (state.ok ? "is-success" : "is-danger") : ""}`}>
      {state?.message ?? ""}
    </p>
  );
}
