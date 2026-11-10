import type { ReactNode } from "react";

/*
 * 실사풍 그림에서 함께 쓰는 조각.
 * 그라데이션은 id가 필요해 같은 그림이 한 화면에 여러 번 나오면 id가 겹친다.
 * 그래서 면을 겹쳐(바탕 + 밝은 띠 + 어두운 띠) 명암과 반사를 표현한다.
 */

const range = (n: number) => Array.from({ length: n }, (_, i) => i);
export { range };

/** 금속 판: 바탕 위에 위쪽 반사, 아래쪽 그늘을 겹친다. */
export function Metal({
  x,
  y,
  w,
  h,
  r = 0,
  base,
  light = "#ffffff",
  dark = "#000000",
  shine = 0.28,
  shade = 0.25,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  r?: number;
  base: string;
  light?: string;
  dark?: string;
  shine?: number;
  shade?: number;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={r} fill={base} />
      <rect x={x} y={y} width={w} height={h * 0.38} rx={r} fill={light} opacity={shine} />
      <rect x={x} y={y + h * 0.7} width={w} height={h * 0.3} rx={r} fill={dark} opacity={shade} />
    </g>
  );
}

/** 축류 팬: 테두리, 날개, 허브. 날개는 휘어진 판을 돌려 그린다. */
export function Fan({
  cx,
  cy,
  r,
  frame = "#1b1b1d",
  blade = "#2e2e33",
  bladeEdge = "#4a4a52",
  hub = "#141416",
  blades = 9,
  ring,
}: {
  cx: number;
  cy: number;
  r: number;
  frame?: string;
  blade?: string;
  bladeEdge?: string;
  hub?: string;
  blades?: number;
  ring?: string;
}) {
  const b = r * 0.92;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={frame} />
      <circle cx={cx} cy={cy} r={b} fill="#0b0b0c" />
      {range(blades).map((i) => (
        <path
          key={i}
          d={`M${cx} ${cy} C ${cx + b * 0.25} ${cy - b * 0.35}, ${cx + b * 0.75} ${cy - b * 0.55}, ${cx + b * 0.98} ${cy - b * 0.12} C ${cx + b * 0.7} ${cy - b * 0.05}, ${cx + b * 0.35} ${cy + b * 0.05}, ${cx} ${cy} Z`}
          fill={blade}
          stroke={bladeEdge}
          strokeWidth={0.6}
          transform={`rotate(${(360 / blades) * i} ${cx} ${cy})`}
        />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.3} fill={hub} />
      <circle cx={cx} cy={cy} r={r * 0.3} fill="#ffffff" opacity={0.06} />
      {ring && <circle cx={cx} cy={cy} r={r * 0.97} fill="none" stroke={ring} strokeWidth={r * 0.06} />}
    </g>
  );
}

/** 둥근 구멍 타공판 */
export function Perforation({ x, y, w, h, gap = 4, r = 1, fill = "#000", opacity = 0.55 }: { x: number; y: number; w: number; h: number; gap?: number; r?: number; fill?: string; opacity?: number }) {
  const cols = Math.floor(w / gap);
  const rows = Math.floor(h / gap);
  const dots: ReactNode[] = [];
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++)
      dots.push(<circle key={`${i}-${j}`} cx={x + gap / 2 + i * gap + (j % 2 ? gap / 2 : 0)} cy={y + gap / 2 + j * gap} r={r} fill={fill} opacity={opacity} />);
  return <g>{dots}</g>;
}

/** 바닥 그림자 */
export function Shadow({ cx, cy, rx, ry = 4, opacity = 0.45 }: { cx: number; cy: number; rx: number; ry?: number; opacity?: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#000" opacity={opacity} />;
}

/** 자동차·모터사이클 바퀴: 타이어, 림, 스포크 */
export function Wheel({
  cx,
  cy,
  r,
  rim = "#2a2a2e",
  spokes = 10,
  spokeColor = "#8a8d94",
  hub = "#55585e",
  tire = "#0d0d0e",
  caliper,
}: {
  cx: number;
  cy: number;
  r: number;
  rim?: string;
  spokes?: number;
  spokeColor?: string;
  hub?: string;
  tire?: string;
  caliper?: string;
}) {
  const inner = r * 0.72;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={tire} />
      <circle cx={cx} cy={cy} r={r * 0.97} fill="none" stroke="#2b2b2e" strokeWidth={r * 0.04} />
      <circle cx={cx} cy={cy} r={inner} fill={rim} />
      {caliper && <rect x={cx + inner * 0.25} y={cy - inner * 0.62} width={inner * 0.42} height={inner * 0.5} rx={2} fill={caliper} transform={`rotate(-20 ${cx} ${cy})`} />}
      {range(spokes).map((i) => (
        <path
          key={i}
          d={`M${cx - r * 0.035} ${cy - inner * 0.22} L${cx - r * 0.08} ${cy - inner * 0.96} L${cx + r * 0.08} ${cy - inner * 0.96} L${cx + r * 0.035} ${cy - inner * 0.22} Z`}
          fill={spokeColor}
          transform={`rotate(${(360 / spokes) * i} ${cx} ${cy})`}
        />
      ))}
      <circle cx={cx} cy={cy} r={inner * 0.24} fill={hub} />
      <circle cx={cx} cy={cy} r={inner * 0.1} fill="#1a1a1c" />
    </g>
  );
}
