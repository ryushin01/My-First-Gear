export type ActionState = { ok: boolean; message: string } | null;

/** 서버 액션 결과 안내. 화면 읽기 프로그램이 읽도록 role=status를 쓴다. */
export function ActionMessage({ state }: { state: ActionState }) {
  return (
    <p role="status" className={`help ${state ? (state.ok ? "is-success" : "is-danger") : ""}`}>
      {state?.message ?? ""}
    </p>
  );
}
