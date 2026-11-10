import type { ReactNode } from "react";
import { Shadow, range } from "./parts";

/* 아웃도어 장비. 로고와 상표 문양은 그리지 않는다. */

/** 아스가르드: 둥근 바닥의 벨 텐트. 낮은 옆벽, 원뿔 지붕, 꼭대기 기둥, A자 출입구와 차양 */
function asgard(): ReactNode {
  const canvas = "#d8c6a0";
  const canvasShade = "#bba67c";
  const canvasDark = "#9c8a62";
  return (
    <g>
      <Shadow cx={100} cy={160} rx={96} ry={8} opacity={0.4} />
      {/* 뒤쪽 당김줄 */}
      <path d="M44 104 L6 158 M156 104 L194 158 M66 80 L22 150 M134 80 L178 150" stroke="#7d6f55" strokeWidth={0.9} />
      {/* 옆벽 (아래가 둥글게) */}
      <path d="M26 108 L174 108 L176 150 Q100 166 24 150 Z" fill={canvasShade} />
      <path d="M26 108 L64 108 L60 156 Q40 154 24 150 Z" fill={canvasDark} opacity={0.5} />
      {/* 원뿔 지붕 */}
      <path d="M100 34 L176 108 Q100 120 24 108 Z" fill={canvas} />
      <path d="M100 34 L24 108 Q46 113 70 116 Z" fill="#000" opacity={0.08} />
      <path d="M100 34 L138 112 Q156 111 176 108 Z" fill="#ffffff" opacity={0.18} />
      {/* 지붕 이음선 */}
      {range(5).map((i) => {
        const x = 40 + i * 30;
        return <path key={i} d={`M100 36 L${x} ${112 + (i === 2 ? 4 : i % 4 === 0 ? 0 : 3)}`} stroke={canvasDark} strokeWidth={0.6} opacity={0.6} />;
      })}
      {/* 벽과 지붕 사이 테두리 끈 */}
      <path d="M24 108 Q100 120 176 108" fill="none" stroke={canvasDark} strokeWidth={1.4} />
      {/* 환기창 */}
      <path d="M70 66 L80 58 L84 68 Z" fill="#4a3f2c" />
      <path d="M130 66 L120 58 L116 68 Z" fill="#4a3f2c" />
      {/* 꼭대기 기둥과 캡 */}
      <rect x={98.5} y={22} width={3} height={14} fill="#3b3b3d" />
      <path d="M94 36 L106 36 L102 30 L98 30 Z" fill={canvasDark} />
      {/* A자 출입구: 지퍼 문을 말아 올린 모습 */}
      <path d="M78 156 L100 92 L122 156 Q100 160 78 156 Z" fill="#2e281e" />
      <path d="M86 156 L100 112 L114 156 Z" fill="#1d1913" />
      <path d="M78 156 L100 92 L104 104 L86 156 Z" fill={canvasShade} />
      <ellipse cx={82} cy={118} rx={6} ry={3.5} fill={canvasDark} transform="rotate(-70 82 118)" />
      {/* 출입구 A자 기둥과 차양 */}
      <path d="M100 86 L72 158 M100 86 L128 158" stroke="#5a5a5e" strokeWidth={2.2} strokeLinecap="round" />
      <path d="M100 84 L126 98 L134 120 L100 108 L66 120 L74 98 Z" fill={canvas} />
      <path d="M100 84 L126 98 L134 120 L100 108 Z" fill="#ffffff" opacity={0.12} />
      <path d="M66 120 L100 108 L134 120" fill="none" stroke={canvasDark} strokeWidth={1} />
      {/* 옆벽 아래 고리와 팩 */}
      {[30, 52, 148, 170].map((x) => (
        <rect key={x} x={x - 1} y={150 + (x === 30 || x === 170 ? 0 : 4)} width={2} height={6} fill="#3b3b3d" />
      ))}
      {/* 앞 당김줄 */}
      <path d="M100 86 L100 82 M74 98 L40 160 M126 98 L160 160" stroke="#7d6f55" strokeWidth={0.9} />
    </g>
  );
}

export const outdoorModels: Record<string, () => ReactNode> = {
  "nordisk-asgard-12-6": asgard,
};
