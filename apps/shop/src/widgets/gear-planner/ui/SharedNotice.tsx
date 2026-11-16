type SharedNoticeProps = {
  /** "견적", "셋업"처럼 받침 있는 낱말 (을·은·으로가 붙는다) */
  what: string;
  onRestore: () => void;
  onDismiss: () => void;
};

/** 공유 주소로 불러왔을 때, 고르던 것으로 되돌리거나 안내를 닫는 줄 */
export function SharedNotice({ what, onRestore, onDismiss }: SharedNoticeProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-[#f2c230]/50 p-3 text-sm">
      <p className="flex-1">
        공유받은 {what}을 불러왔습니다. 고르던 {what}은 따로 남겨 두었습니다.
      </p>
      <button type="button" onClick={onRestore} className="min-h-11 rounded-md border border-white/30 px-4 hover:border-white">
        이전 {what}으로 되돌리기
      </button>
      <button type="button" onClick={onDismiss} className="min-h-11 rounded-md px-3 text-mute-200 hover:text-cream">
        닫기<span className="sr-only">: 이전 {what} 안내</span>
      </button>
    </div>
  );
}
