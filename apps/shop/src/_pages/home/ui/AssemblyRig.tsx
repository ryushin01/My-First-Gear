import type { CSSProperties, ReactNode } from "react";
import { TorqueBack, TorqueFront } from "@mfg/gear-art";

/**
 * 홈 조립 장면의 그림. 실제 견적 한 대를 안텍 토크 화이트의 강화유리 쪽에서 본 모습으로 그린다.
 * ROG MAXIMUS Z690 EXTREME, i9-12900K, 삼성 DDR5 16GB ×4, 980 PRO ×3, NZXT KRAKEN Z73 RGB,
 * ROG STRIX RTX 3090(쿨러마스터 세로 거치대 V2·ROG Strix 라이저 케이블), ROG THOR 1200W.
 * 각 부품은 제품 사진을 보고 모양과 색을 따랐고, 로고와 상표 문양, 제품 이름 글자는 그리지 않는다.
 */

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

type PartMotion = {
  /** 날아들기 시작하는 지점(장면 스크롤의 %) */
  start: number;
  /** 시작할 때 떨어져 있는 거리(그림 좌표)와 기울기 */
  dx: number;
  dy: number;
  rot: number;
};

function Part({ motion, children }: { motion: PartMotion; children: ReactNode }) {
  const style = {
    "--s": `${motion.start}%`,
    "--dx": `${motion.dx}px`,
    "--dy": `${motion.dy}px`,
    "--rot": `${motion.rot}deg`,
  } as CSSProperties;
  return (
    <g className="assembly-part" style={style}>
      {children}
    </g>
  );
}

/** 7세그먼트 숫자 하나 (Q-Code, 펌프 LCD, 파워 OLED) */
const SEGMENTS: Record<string, string> = {
  "0": "abcdef",
  "1": "bc",
  "2": "abged",
  "3": "abgcd",
  "4": "fgbc",
  "5": "afgcd",
  "8": "abcdefg",
};

function Digit({ x, y, w, h, t, d, color }: { x: number; y: number; w: number; h: number; t: number; d: string; color: string }) {
  const half = h / 2;
  const rects: Record<string, [number, number, number, number]> = {
    a: [x + t, y, w - 2 * t, t],
    b: [x + w - t, y + t * 0.6, t, half - t * 0.8],
    c: [x + w - t, y + half + t * 0.2, t, half - t * 0.8],
    d: [x + t, y + h - t, w - 2 * t, t],
    e: [x, y + half + t * 0.2, t, half - t * 0.8],
    f: [x, y + t * 0.6, t, half - t * 0.8],
    g: [x + t, y + half - t / 2, w - 2 * t, t],
  };
  return (
    <g fill={color}>
      {[...SEGMENTS[d]].map((s) => {
        const [rx, ry, rw, rh] = rects[s];
        return <rect key={s} x={rx} y={ry} width={rw} height={rh} />;
      })}
    </g>
  );
}

/** ROG STRIX의 Axial-tech 팬: 날개 끝을 잇는 고리와 은색 허브 */
function AxialFan({ cx, cy, r, reverse = false }: { cx: number; cy: number; r: number; reverse?: boolean }) {
  const blade = `M${cx} ${cy - r * 0.3} C ${cx + r * 0.35} ${cy - r * 0.5}, ${cx + r * 0.55} ${cy - r * 0.85}, ${cx + r * 0.28} ${cy - r * 0.95} L ${cx - r * 0.02} ${cy - r * 0.95} C ${cx + r * 0.18} ${cy - r * 0.8}, ${cx + r * 0.04} ${cy - r * 0.52}, ${cx - r * 0.12} ${cy - r * 0.3} Z`;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#101114" />
      <g transform={reverse ? `translate(${2 * cx} 0) scale(-1 1)` : undefined}>
        {range(13).map((i) => (
          <path key={i} d={blade} fill="#2b2d32" stroke="#43464d" strokeWidth={0.5} transform={`rotate(${(360 / 13) * i} ${cx} ${cy})`} />
        ))}
      </g>
      <circle cx={cx} cy={cy} r={r * 0.95} fill="none" stroke="#33363c" strokeWidth={2.2} />
      <circle cx={cx} cy={cy} r={r * 0.3} fill="#c5cad1" />
      <circle cx={cx} cy={cy} r={r * 0.3} fill="none" stroke="#7d8189" strokeWidth={1} />
      <circle cx={cx - r * 0.08} cy={cy - r * 0.08} r={r * 0.12} fill="#ffffff" opacity={0.5} />
    </g>
  );
}

/** 위에 단 라디에이터 아래의 팬: 아래를 보고 누워 있어 거의 옆모습(타원)으로 보인다 */
function FlatFan({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <rect x={cx - 38} y={cy - 9} width={76} height={4} fill="#17181b" />
      <ellipse cx={cx} cy={cy} rx={36} ry={8} fill="#141518" />
      {range(7).map((i) => {
        const a = (Math.PI * 2 * i) / 7;
        return (
          <path
            key={i}
            d={`M${cx} ${cy} L${cx + 30 * Math.cos(a)} ${cy + 6.4 * Math.sin(a)}`}
            fill="none"
            stroke="#2c2e33"
            strokeWidth={2.6}
            strokeLinecap="round"
          />
        );
      })}
      <ellipse cx={cx} cy={cy} rx={35} ry={7.2} fill="none" stroke="url(#asm-rgb)" strokeWidth={2} />
      <ellipse cx={cx} cy={cy} rx={9} ry={2.4} fill="#222428" />
    </g>
  );
}

/** AniMe Matrix에 켜진 점(사선 무늬) */
const ANIME_LIT = [
  [1, 3],
  [2, 4],
  [3, 5],
  [4, 6],
  [5, 7],
  [6, 8],
  [1, 9],
  [2, 10],
  [3, 11],
  [4, 12],
  [5, 13],
  [6, 14],
];

/** M.2 방열판의 X자 점 무늬 */
const ARMOR_LIT = [0, 1, 2, 3, 4, 5].flatMap((k) => [
  [114 + 4 * k, 222 + 4 * k],
  [134 - 4 * k, 222 + 4 * k],
  [146 + 4 * k, 222 + 4 * k],
  [166 - 4 * k, 222 + 4 * k],
]);

export function AssemblyRig({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 440" className={className} overflow="visible">
      <defs>
        <linearGradient id="asm-rgb" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff2fb4" />
          <stop offset="0.5" stopColor="#7a5cff" />
          <stop offset="1" stopColor="#21d4ff" />
        </linearGradient>
        <radialGradient id="asm-lcd" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#1b2b4a" />
          <stop offset="0.7" stopColor="#0a1222" />
          <stop offset="1" stopColor="#05080f" />
        </radialGradient>
        {/* 촘촘한 타공 점: AniMe Matrix(밝은 판 위 어두운 점)와 M.2 방열판(어두운 판 위 밝은 점) */}
        <pattern id="asm-dots" width={4} height={4} patternUnits="userSpaceOnUse">
          <circle cx={2} cy={2} r={0.9} fill="#2a2c30" />
        </pattern>
        <pattern id="asm-dots-dark" width={4} height={4} patternUnits="userSpaceOnUse">
          <circle cx={2} cy={2} r={0.8} fill="#4a4d54" />
        </pattern>
      </defs>

      {/* 안텍 토크 화이트: 뼈대·받침·다리 */}
      <g className="assembly-case">
        <TorqueBack />
      </g>

      {/* ROG MAXIMUS Z690 EXTREME: 구리빛 테두리의 E-ATX 기판, AniMe Matrix I/O 덮개, 핀 방열판 */}
      <Part motion={{ start: 2, dx: -260, dy: -60, rot: -14 }}>
        <rect x={100} y={100} width={182} height={200} rx={2} fill="#101114" stroke="#a8703f" strokeWidth={1.2} />
        <path d="M100 100 H142 V170 L132 196 H100 Z" fill="#2e3035" />
        <rect x={104} y={106} width={32} height={80} rx={1.5} fill="#8d9198" />
        <rect x={104} y={106} width={32} height={80} rx={1.5} fill="url(#asm-dots)" />
        {ANIME_LIT.map(([c, r]) => (
          <circle key={`${c}-${r}`} cx={106 + 4 * c} cy={110 + 4 * r} r={1.1} fill="#f4f6f8" />
        ))}
        <rect x={100} y={100} width={42} height={3} fill="#ffffff" opacity={0.12} />
        {/* 소켓 위·왼쪽 VRM 방열판 */}
        <rect x={142} y={102} width={72} height={18} rx={1.5} fill="#1b1c20" />
        {range(11).map((i) => (
          <rect key={i} x={146 + i * 6} y={104} width={2.4} height={14} fill="#34363c" />
        ))}
        <rect x={142} y={122} width={12} height={70} rx={1.5} fill="#1b1c20" />
        {range(10).map((i) => (
          <rect key={i} x={144} y={126 + i * 6.4} width={8} height={2.2} fill="#34363c" />
        ))}
        {/* LGA1700 소켓: 세로로 긴 고정 틀과 레버 */}
        <rect x={158} y={126} width={40} height={46} rx={2} fill="#9da2a9" />
        <rect x={163} y={131} width={30} height={36} fill="#2a2c30" />
        <path d="M202 128 V172 H196" fill="none" stroke="#c3c7cd" strokeWidth={2} />
        {/* DDR5 슬롯 4개와 걸쇠 */}
        {range(4).map((i) => (
          <g key={i}>
            <rect x={220 + i * 10} y={114} width={7} height={98} fill="#25272b" />
            <rect x={220 + i * 10} y={111} width={7} height={4} fill="#3a3c41" />
            <rect x={220 + i * 10} y={211} width={7} height={4} fill="#3a3c41" />
          </g>
        ))}
        {/* 24핀 전원, Q-Code와 버튼 */}
        <rect x={268} y={136} width={10} height={52} rx={1} fill="#1a1b1e" />
        {range(12).map((i) => (
          <rect key={i} x={270} y={139 + i * 4} width={6} height={2} fill="#2f3136" />
        ))}
        <rect x={258} y={194} width={20} height={13} rx={1} fill="#050506" />
        <Digit x={260.5} y={196.5} w={6.5} h={8} t={1.2} d="4" color="#ff4d2e" />
        <Digit x={269} y={196.5} w={6.5} h={8} t={1.2} d="0" color="#ff4d2e" />
        <rect x={262} y={210} width={7} height={5} rx={1} fill="#c4302b" />
        <rect x={271} y={210} width={7} height={5} rx={1} fill="#3a3c41" />
        {/* PCIe x16 슬롯 두 개(금속 보강) */}
        {[212, 247].map((y) => (
          <g key={y}>
            <rect x={120} y={y} width={58} height={6} rx={1} fill="#c9ccd2" />
            <rect x={122} y={y + 2} width={54} height={2} fill="#55585e" />
          </g>
        ))}
        {/* M.2 자리 세 개: 소켓과 나사 기둥 */}
        {[
          [116, 223],
          [182, 223],
          [116, 260],
        ].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <rect x={x} y={y} width={58} height={14} fill="#17181b" />
            <rect x={x} y={y + 2} width={4} height={10} fill="#2b2d31" />
            <circle cx={x + 56} cy={y + 7} r={1.6} fill="#8d9097" />
          </g>
        ))}
      </Part>

      {/* i9-12900K: 청록 기판 위 모서리가 꺾인 니켈 히트스프레더, 소켓에 세로로 놓인다 */}
      <Part motion={{ start: 10, dx: -120, dy: -220, rot: 30 }}>
        <rect x={166} y={134} width={24} height={30} rx={1.5} fill="#1d5a52" />
        <path d="M170.5 137 H185.5 V140 H187.5 V158 H185.5 V161 H170.5 V158 H168.5 V140 H170.5 Z" fill="#c9cdd2" />
        <rect x={170.5} y={137} width={15} height={7} fill="#ffffff" opacity={0.3} />
        <path d="M172 147 h12 M172 151 h9 M172 155 h11" fill="none" stroke="#9a9ea5" strokeWidth={0.8} />
        <path d="M166.6 163.4 h3 l-3 -3 Z" fill="#d4a63b" />
      </Part>

      {/* 삼성 DDR5 16GB ×4: 슬롯에 선 초록 기판을 위에서 보면 칩 여덟 개와 가운데 PMIC가 보인다 */}
      {range(4).map((i) => {
        const x = 220 + i * 10;
        return (
          <Part key={i} motion={{ start: 22 + i * 3, dx: 160 + i * 20, dy: -120 + i * 30, rot: 22 - i * 8 }}>
            <rect x={x} y={118} width={7} height={90} rx={0.8} fill="#1f6b40" />
            <rect x={x} y={118} width={1.4} height={90} fill="#2f8a57" />
            {range(8).map((c) => (
              <rect key={c} x={x + 2.6} y={c < 4 ? 121 + c * 9 : 168 + (c - 4) * 9} width={4.4} height={7.4} fill="#141518" />
            ))}
            <rect x={x + 2.6} y={158} width={4.4} height={6} fill="#3a3c41" />
          </Part>
        );
      })}

      {/* 삼성 980 PRO ×3: 검은 기판과 검은 라벨, 금 단자는 M.2 소켓 쪽 */}
      {[
        [116, 223],
        [182, 223],
        [116, 260],
      ].map(([x, y], i) => (
        <Part key={`${x}-${y}`} motion={{ start: 32 + i * 3, dx: -200, dy: 40 + i * 30, rot: -25 + i * 10 }}>
          <rect x={x} y={y} width={58} height={14} rx={1.2} fill="#0e0f11" />
          <rect x={x + 6} y={y + 1.5} width={46} height={11} fill="#1b1c1f" />
          <rect x={x + 9} y={y + 4} width={7} height={1.6} fill="#e7e7e7" />
          <rect x={x + 17} y={y + 4} width={6} height={1.6} fill="#e3342f" />
          <rect x={x + 9} y={y + 7.5} width={14} height={1} fill="#9a9ea5" />
          <rect x={x + 30} y={y + 3.5} width={6} height={6} fill="#d9dadb" />
          <rect x={x + 39} y={y + 4} width={10} height={1} fill="#9a9ea5" />
          <rect x={x + 39} y={y + 7} width={7} height={1} fill="#9a9ea5" />
          <rect x={x} y={y + 1} width={3.5} height={12} fill="#d4a63b" />
          <circle cx={x + 56} cy={y + 7} r={1.6} fill="#2b2d31" />
        </Part>
      ))}

      {/* Z690 EXTREME의 M.2 방열판: SSD를 덮는 짙은 장갑판, X자 점 무늬와 결, LiveDash OLED */}
      <Part motion={{ start: 43, dx: 220, dy: 80, rot: 10 }}>
        <path d="M104 220 H276 L280 224 V244 H104 Z" fill="#2c2e33" />
        <path d="M104 256 H280 V292 L274 298 H104 Z" fill="#2c2e33" />
        <rect x={104} y={220} width={72} height={24} fill="url(#asm-dots-dark)" />
        <rect x={104} y={256} width={72} height={42} fill="url(#asm-dots-dark)" />
        {ARMOR_LIT.map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={1} fill="#cfd2d7" />
        ))}
        {range(14).map((i) => (
          <path key={i} d={`M${182 + i * 7} 244 L${194 + i * 7} 220`} fill="none" stroke="#373a40" strokeWidth={1} />
        ))}
        <rect x={104} y={220} width={176} height={1.5} fill="#ffffff" opacity={0.12} />
        <path d="M236 258 H280 V292 L274 298 H236 Z" fill="#383b41" />
        <rect x={244} y={262} width={26} height={16} rx={1} fill="#050506" />
        <path d="M247 274 L253 270 L258 273 L263 266 L267 268" fill="none" stroke="#5fd3ff" strokeWidth={1.2} />
      </Part>

      {/* NZXT KRAKEN Z73 RGB: 360mm 라디에이터를 위에 달아 RGB 팬 셋이 아래를 본다 */}
      <Part motion={{ start: 52, dx: 0, dy: -240, rot: 0 }}>
        <rect x={62} y={62} width={254} height={14} rx={2} fill="#121316" />
        <rect x={62} y={62} width={22} height={14} rx={2} fill="#1a1b1e" />
        {range(57).map((i) => (
          <rect key={i} x={86 + i * 4} y={64} width={1.2} height={10} fill="#26282c" />
        ))}
        {[123, 200, 277].map((cx) => (
          <FlatFan key={cx} cx={cx} cy={86} />
        ))}
      </Part>

      {/* KRAKEN 펌프: 원형 LCD에 액체 온도와 반원 게이지, 라디에이터로 가는 감싼 호스 두 가닥 */}
      <Part motion={{ start: 58, dx: 180, dy: -160, rot: 40 }}>
        {["M158 132 C 130 120, 80 120, 70 78", "M164 126 C 140 106, 92 104, 80 78"].map((d) => (
          <g key={d}>
            <path d={d} fill="none" stroke="#1a1b1e" strokeWidth={6.5} strokeLinecap="round" />
            <path d={d} fill="none" stroke="#2c2d31" strokeWidth={6.5} strokeDasharray="1.5 2.5" />
          </g>
        ))}
        <circle cx={178} cy={148} r={26} fill="#1a1b1e" />
        <circle cx={178} cy={148} r={26} fill="none" stroke="#2e3035" strokeWidth={2} />
        <circle cx={178} cy={148} r={21} fill="url(#asm-lcd)" />
        <circle
          cx={178}
          cy={148}
          r={17}
          fill="none"
          stroke="url(#asm-rgb)"
          strokeWidth={3}
          strokeDasharray="80 27"
          transform="rotate(135 178 148)"
        />
        <Digit x={169.5} y={141} w={7} h={11} t={1.7} d="3" color="#eef4ff" />
        <Digit x={178.5} y={141} w={7} h={11} t={1.7} d="2" color="#eef4ff" />
        <rect x={172} y={156} width={12} height={1.4} rx={0.7} fill="#8fa0b8" />
      </Part>

      {/* ROG Strix 라이저 케이블: 일곱 갈래 납작 케이블이 위 PCIe 슬롯에서 그래픽카드 뒤로 내려간다 */}
      <Part motion={{ start: 68, dx: -140, dy: 120, rot: -30 }}>
        <rect x={118} y={208} width={62} height={11} rx={1.5} fill="#18191c" />
        <rect x={118} y={208} width={62} height={2} fill="#ffffff" opacity={0.08} />
        <rect x={120} y={219} width={58} height={54} fill="#141518" />
        {range(6).map((i) => (
          <rect key={i} x={128 + i * 8.3} y={219} width={0.9} height={54} fill="#2c2e33" />
        ))}
      </Part>

      {/* 쿨러마스터 세로 그래픽카드 거치대 V2: 창이 뚫린 뒤 브래킷, 손나사, 아래 PCIe 슬롯 */}
      <Part motion={{ start: 71, dx: -180, dy: 60, rot: 18 }}>
        <rect x={84} y={262} width={16} height={104} fill="#17181b" />
        <rect x={88} y={272} width={8} height={72} fill="#050506" />
        {range(4).map((i) => (
          <rect key={i} x={89} y={348 + i * 4} width={6} height={1.6} fill="#050506" />
        ))}
        <rect x={100} y={264} width={204} height={6} fill="#17181b" />
        <rect x={84} y={360} width={220} height={6} fill="#17181b" />
        <rect x={120} y={361.5} width={110} height={3} fill="#2b2c30" />
        <rect x={122} y={362.5} width={106} height={1} fill="#8d9097" />
        {[
          [92, 262],
          [296, 266],
        ].map(([cx, cy]) => (
          <g key={cx}>
            <circle cx={cx} cy={cy} r={3.6} fill="#26282c" />
            <circle cx={cx} cy={cy} r={1.6} fill="#55585e" />
          </g>
        ))}
      </Part>

      {/* ROG STRIX RTX 3090: 세로로 세워 팬 셋이 유리 쪽을 본다. 철회색 몸체를 지나는 은색 사선 판 */}
      <Part motion={{ start: 76, dx: 40, dy: 260, rot: -12 }}>
        <rect x={96} y={268} width={5} height={94} fill="#c9ccd2" />
        {range(5).map((i) => (
          <rect key={i} x={97.5} y={276 + i * 16} width={2} height={10} fill="#6d7178" />
        ))}
        <path d="M104 270 H296 L304 278 V352 L296 360 H104 L101 356 V274 Z" fill="#2a2c31" />
        {range(30).map((i) => (
          <rect key={i} x={108 + i * 6.5} y={274} width={1.4} height={82} fill="#1c1d21" />
        ))}
        <path d="M104 270 L150 270 L136 281 L104 281 Z" fill="#aeb3bb" />
        <path d="M250 360 L296 360 L304 352 L304 344 L262 350 Z" fill="#aeb3bb" />
        {[170, 236].map((x) => (
          <path key={x} d={`M${x - 8} 272 L${x + 2} 272 L${x + 14} 358 L${x + 4} 358 Z`} fill="#b9bec6" />
        ))}
        <path d="M104 270 H296 L304 278 V352 L296 360 H104 L101 356 V274 Z" fill="none" stroke="#aeb3bb" strokeWidth={2.4} />
        <path d="M112 271 H290" fill="none" stroke="url(#asm-rgb)" strokeWidth={2.5} strokeLinecap="round" />
        {[136, 202, 268].map((cx, i) => (
          <AxialFan key={cx} cx={cx} cy={315} r={31} reverse={i === 1} />
        ))}
      </Part>

      {/* ROG THOR 1200W: 윗면 방열 줄무늬, 옆면의 가는 선 무늬와 전력 OLED, 사선 RGB 띠 */}
      <Part motion={{ start: 84, dx: 220, dy: 160, rot: 16 }}>
        <rect x={150} y={366} width={124} height={54} rx={2} fill="#141518" />
        <rect x={150} y={366} width={124} height={5} rx={2} fill="#202226" />
        {range(15).map((i) => (
          <rect key={i} x={154 + i * 8} y={366.5} width={4} height={4} fill="#2c2e33" />
        ))}
        <path
          d="M156 380 L176 380 L186 392 M156 404 L170 404 L182 414 L214 414 M232 378 L262 378 L268 386 M248 398 L268 398"
          fill="none"
          stroke="#3b3e44"
          strokeWidth={1}
        />
        <rect x={158} y={384} width={36} height={14} rx={1} fill="#030304" />
        <Digit x={161} y={387} w={5} h={8} t={1.1} d="5" color="#f2f2f2" />
        <Digit x={167.5} y={387} w={5} h={8} t={1.1} d="4" color="#f2f2f2" />
        <Digit x={174} y={387} w={5} h={8} t={1.1} d="0" color="#f2f2f2" />
        <path d="M181.5 387 L183 395 L185 390 L187 395 L188.5 387" fill="none" stroke="#f2f2f2" strokeWidth={1.1} />
        <path d="M204 367 L244 419" fill="none" stroke="#ff3d8b" strokeWidth={6} opacity={0.25} />
        <path d="M204 367 L244 419" fill="none" stroke="#ff5aa0" strokeWidth={2} />
        <rect x={270} y={368} width={4} height={50} fill="#1d1f23" />
      </Part>

      {/* 안텍 토크 화이트: 흰 앞 판·위 판과 강화유리 */}
      <g className="assembly-case">
        <TorqueFront />
      </g>
    </svg>
  );
}
