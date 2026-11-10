import type { ReactNode } from "react";
import { Shadow, range } from "./parts";

/* 시계는 정면. 글자 대신 인덱스와 막대로 표시하고, 브랜드 표기는 그리지 않는다. */

function strap(color: string, stitch: string): ReactNode {
  return (
    <g>
      <rect x={78} y={4} width={44} height={60} rx={6} fill={color} />
      <rect x={78} y={136} width={44} height={60} rx={6} fill={color} />
      <path d="M82 8 V60 M118 8 V60 M82 140 V192 M118 140 V192" stroke={stitch} strokeWidth={1} strokeDasharray="3 3" />
      <rect x={92} y={176} width={16} height={4} rx={2} fill="#000" opacity={0.3} />
    </g>
  );
}

function hands(cx: number, cy: number, r: number, color: string): ReactNode {
  return (
    <g>
      {/* 시침 10시 10분 */}
      <path d={`M${cx} ${cy} L${cx - r * 0.42} ${cy - r * 0.24}`} stroke={color} strokeWidth={5} strokeLinecap="round" />
      <path d={`M${cx} ${cy} L${cx + r * 0.6} ${cy - r * 0.52}`} stroke={color} strokeWidth={3.6} strokeLinecap="round" />
      <path d={`M${cx - r * 0.2} ${cy + r * 0.22} L${cx + r * 0.66} ${cy - r * 0.62}`} stroke="#e8463b" strokeWidth={1.2} />
      <circle cx={cx} cy={cy} r={3} fill={color} />
    </g>
  );
}

function indices(cx: number, cy: number, r: number, color: string, arabic: boolean): ReactNode {
  return (
    <g>
      {range(60).map((i) => (
        <rect key={`m${i}`} x={cx - 0.5} y={cy - r} width={1} height={i % 5 === 0 ? 0 : 3} fill={color} opacity={0.7} transform={`rotate(${i * 6} ${cx} ${cy})`} />
      ))}
      {range(12).map((i) =>
        arabic && i % 3 === 0 ? null : (
          <rect key={i} x={cx - 1.6} y={cy - r + 1} width={3.2} height={i === 0 ? 11 : 9} fill={color} transform={`rotate(${i * 30} ${cx} ${cy})`} />
        ),
      )}
      {/* 3·6·9·12 자리를 굵은 사각 인덱스로 */}
      {arabic && range(4).map((i) => <rect key={`q${i}`} x={cx - 3.5} y={cy - r + 2} width={7} height={11} rx={1} fill={color} transform={`rotate(${i * 90} ${cx} ${cy})`} />)}
    </g>
  );
}

/** 556 I: 38.5mm 무광 스틸, 검은 문자판, 굵은 막대 인덱스 */
function sinn556(): ReactNode {
  const cx = 100;
  const cy = 100;
  return (
    <g>
      <Shadow cx={100} cy={194} rx={30} ry={3} />
      {strap("#2a2b2f", "#55575d")}
      {/* 러그 */}
      <rect x={74} y={52} width={10} height={20} rx={3} fill="#a9adb3" />
      <rect x={116} y={52} width={10} height={20} rx={3} fill="#a9adb3" />
      <rect x={74} y={128} width={10} height={20} rx={3} fill="#a9adb3" />
      <rect x={116} y={128} width={10} height={20} rx={3} fill="#a9adb3" />
      <circle cx={cx} cy={cy} r={44} fill="#b4b8be" />
      <circle cx={cx} cy={cy} r={44} fill="none" stroke="#8a8e94" strokeWidth={1} />
      <path d="M62 82 A 44 44 0 0 1 118 58" fill="none" stroke="#ffffff" strokeWidth={3} opacity={0.45} />
      <rect x={143} y={95} width={8} height={10} rx={2} fill="#a9adb3" />
      <circle cx={cx} cy={cy} r={37} fill="#0f1012" />
      {indices(cx, cy, 34, "#f2f2f0", true)}
      {/* 날짜 창 */}
      <rect x={118} y={96} width={10} height={8} fill="#f2f2f0" />
      {hands(cx, cy, 34, "#f2f2f0")}
      <path d="M70 76 A 37 37 0 0 1 108 63" fill="none" stroke="#ffffff" strokeWidth={4} opacity={0.08} />
    </g>
  );
}

/** 104 St Sa A: 회전 베젤, 요일·날짜 창, 아라비아 숫자 대신 큰 인덱스 */
function sinn104(): ReactNode {
  const cx = 100;
  const cy = 100;
  return (
    <g>
      <Shadow cx={100} cy={194} rx={30} ry={3} />
      {strap("#5a3a22", "#a4774f")}
      <rect x={72} y={50} width={12} height={22} rx={3} fill="#b9bdc3" />
      <rect x={116} y={50} width={12} height={22} rx={3} fill="#b9bdc3" />
      <rect x={72} y={128} width={12} height={22} rx={3} fill="#b9bdc3" />
      <rect x={116} y={128} width={12} height={22} rx={3} fill="#b9bdc3" />
      <circle cx={cx} cy={cy} r={48} fill="#c3c7cd" />
      {/* 톱니 모양 회전 베젤 */}
      {range(60).map((i) => (
        <rect key={`k${i}`} x={cx - 1.2} y={cy - 49} width={2.4} height={3} fill="#9a9ea5" transform={`rotate(${i * 6} ${cx} ${cy})`} />
      ))}
      <circle cx={cx} cy={cy} r={44} fill="#17191d" />
      {range(60).map((i) => (
        <rect key={`b${i}`} x={cx - (i % 5 === 0 ? 1.4 : 0.6)} y={cy - 44} width={i % 5 === 0 ? 2.8 : 1.2} height={i % 5 === 0 ? 6 : 3} fill="#e9e9e6" transform={`rotate(${i * 6} ${cx} ${cy})`} />
      ))}
      <path d={`M${cx} ${cy - 43} l-4 7 h8 Z`} fill="#e8463b" />
      <rect x={146} y={94} width={8} height={12} rx={2} fill="#b9bdc3" />
      <circle cx={cx} cy={cy} r={35} fill="#1c3b6e" />
      <circle cx={cx} cy={cy} r={35} fill="#ffffff" opacity={0.04} />
      {indices(cx, cy, 32, "#f2f2f0", false)}
      {/* 요일·날짜 창 */}
      <rect x={110} y={95} width={20} height={10} fill="#f2f2f0" />
      <rect x={112} y={99} width={9} height={2} fill="#1c1c1c" />
      <rect x={123} y={99} width={5} height={2} fill="#1c1c1c" />
      {hands(cx, cy, 32, "#f2f2f0")}
      <path d="M58 82 A 44 44 0 0 1 112 57" fill="none" stroke="#ffffff" strokeWidth={4} opacity={0.12} />
    </g>
  );
}

export const watchModels: Record<string, () => ReactNode> = {
  "sinn-556-i": sinn556,
  "sinn-104-st-sa-a": sinn104,
};
