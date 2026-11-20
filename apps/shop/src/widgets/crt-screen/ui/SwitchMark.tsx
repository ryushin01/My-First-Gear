/** 토글 버튼 안의 ON/OFF 표시. 켜진 쪽을 흰 바탕으로 뒤집는다. 상태는 버튼의 aria-pressed가 알리므로 장식으로 숨긴다. */
export function SwitchMark({ on }: { on: boolean }) {
  const cell = (active: boolean) => (active ? "bg-cream px-1.5 text-ink" : "px-1.5");
  return (
    <span aria-hidden="true" className="inline-flex border border-current p-px leading-5">
      <span className={cell(on)}>ON</span>
      <span className={cell(!on)}>OFF</span>
    </span>
  );
}
