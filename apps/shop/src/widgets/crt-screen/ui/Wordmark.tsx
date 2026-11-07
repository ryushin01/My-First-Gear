const BARS = ["#c0c0c0", "#c0c000", "#00c0c0", "#00c000", "#c000c0", "#c00000", "#0000c0"];

/** 컬러 바 띠와 세리프 글자로 만든 워드마크 */
export function Wordmark() {
  return (
    <span className="flex flex-col items-center gap-1">
      <span className="flex items-center gap-2">
        <span aria-hidden="true" className="flex h-5 overflow-hidden rounded-sm">
          {BARS.map((color) => (
            <span key={color} className="block w-1.5" style={{ background: color }} />
          ))}
        </span>
        <span className="rgb-split font-display text-2xl leading-none tracking-tight text-cream">
          My First Gear
        </span>
      </span>
    </span>
  );
}
