import type { CSSProperties, ReactNode } from "react";

/**
 * 홈 조립 장면의 그림. 실제 견적 한 대를 옆판 없는 쪽에서 본 모습으로 그린다.
 * 안텍 토크 화이트, ROG MAXIMUS Z690 EXTREME, i9-12900K, 삼성 DDR5 16GB ×4, 980 PRO ×3,
 * NZXT KRAKEN Z73 RGB, ROG STRIX RTX 3090(세로 거치대·라이저 케이블), ROG THOR 1200W.
 * 로고와 상표 문양은 그리지 않는다.
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

/** 팬: 테두리, 날개, 가운데 허브. rgb면 둘레에 빛 고리를 두른다. */
function Fan({ cx, cy, r, rgb = false }: { cx: number; cy: number; r: number; rgb?: boolean }) {
  return (
    <g>
      {rgb && <circle cx={cx} cy={cy} r={r + 1.5} fill="none" stroke="url(#asm-rgb)" strokeWidth={2.5} />}
      <circle cx={cx} cy={cy} r={r} fill="#16171a" />
      {range(9).map((i) => (
        <path
          key={i}
          d={`M${cx} ${cy} q ${r * 0.55} ${-r * 0.2} ${r * 0.9} ${r * 0.18} q ${-r * 0.35} ${r * 0.12} ${-r * 0.9} ${-r * 0.18}`}
          fill="#2c2e33"
          stroke="#3c3f45"
          strokeWidth={0.6}
          transform={`rotate(${i * 40} ${cx} ${cy})`}
        />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.28} fill="#222428" stroke="#44474e" strokeWidth={0.8} />
    </g>
  );
}

export function AssemblyRig({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 440" className={className} overflow="visible">
      <defs>
        <linearGradient id="asm-rgb" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff2fb4" />
          <stop offset="0.5" stopColor="#7a5cff" />
          <stop offset="1" stopColor="#21d4ff" />
        </linearGradient>
        <linearGradient id="asm-plate" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d7d8d6" />
        </linearGradient>
        <radialGradient id="asm-lcd" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#1b2b4a" />
          <stop offset="0.7" stopColor="#0a1222" />
          <stop offset="1" stopColor="#05080f" />
        </radialGradient>
      </defs>

      {/* 안텍 토크 화이트: 뒤 알루미늄 판, 흰 트레이, 앞 판 두 장, 위아래 기둥 */}
      <g className="assembly-case">
        <ellipse cx={200} cy={430} rx={170} ry={7} fill="#000" opacity={0.45} />
        <rect x={70} y={58} width={258} height={346} fill="#e8e8e5" />
        {range(5).map((i) => (
          <rect key={i} x={84} y={82 + i * 66} width={10} height={30} rx={5} fill="#cfcfcb" />
        ))}
        <path d="M28 26 L62 18 L62 424 L28 432 Z" fill="url(#asm-plate)" />
        <path d="M28 26 L62 18 L62 90 L28 100 Z" fill="#fff" opacity={0.5} />
        <path d="M336 18 L352 24 L352 428 L336 424 Z" fill="url(#asm-plate)" />
        <path d="M358 26 L376 32 L376 432 L358 428 Z" fill="#dcdcd9" />
        <rect x={62} y={40} width={274} height={9} fill="#b9bcc1" />
        <rect x={62} y={40} width={274} height={3} fill="#fff" opacity={0.6} />
        <rect x={62} y={406} width={274} height={9} fill="#b9bcc1" />
        <rect x={40} y={430} width={16} height={6} fill="#bdbdb9" />
        <rect x={344} y={430} width={16} height={6} fill="#bdbdb9" />
      </g>

      {/* ROG MAXIMUS Z690 EXTREME: E-ATX 검은 기판, 건메탈 방열판, 거울 같은 I/O 덮개 */}
      <Part motion={{ start: 2, dx: -260, dy: -60, rot: -14 }}>
        <rect x={86} y={66} width={226} height={274} rx={3} fill="#111214" />
        <path d="M90 70 H150 V92 H128 V196 H90 Z" fill="#2f3237" />
        <path d="M90 70 H150 V78 H90 Z" fill="#8b9097" opacity={0.6} />
        <rect x={94} y={98} width={30} height={92} fill="#1b1d22" />
        {range(6).map((i) => (
          <path key={i} d={`M95 ${104 + i * 14} l28 -10`} stroke="#5a5f68" strokeWidth={1.4} />
        ))}
        <rect x={156} y={70} width={92} height={18} fill="#2f3237" />
        {range(7).map((i) => (
          <rect key={i} x={160 + i * 12} y={73} width={7} height={12} fill="#45494f" />
        ))}
        {/* LGA1700 소켓 */}
        <rect x={160} y={104} width={68} height={60} rx={2} fill="#8f949b" />
        <rect x={166} y={110} width={56} height={48} fill="#2a2c30" />
        {/* 메모리 슬롯 네 칸 */}
        {range(4).map((i) => (
          <rect key={i} x={244 + i * 12} y={94} width={6} height={104} fill="#3a3c41" />
        ))}
        {/* PCIe 슬롯(금속 보강) */}
        <rect x={112} y={214} width={164} height={7} fill="#c7cad0" />
        <rect x={112} y={300} width={164} height={7} fill="#7d8188" />
        {/* M.2 자리 */}
        {[188, 240, 272].map((y) => (
          <rect key={y} x={118} y={y} width={76} height={14} fill="#1d1f23" stroke="#30333a" strokeWidth={1} />
        ))}
        {/* 칩셋 방열판 */}
        <path d="M214 236 H306 V334 H236 L214 312 Z" fill="#2f3237" />
        {range(5).map((i) => (
          <path key={i} d={`M${226 + i * 16} 330 l20 -80`} stroke="#5a5f68" strokeWidth={1.4} />
        ))}
        <path d="M214 236 H306 V242 H214 Z" fill="#8b9097" opacity={0.6} />
      </Part>

      {/* i9-12900K: 길쭉한 LGA1700 기판과 히트스프레더 */}
      <Part motion={{ start: 10, dx: -120, dy: -220, rot: 30 }}>
        <rect x={170} y={113} width={48} height={42} rx={2} fill="#1f5a3a" />
        <rect x={176} y={118} width={36} height={32} rx={2} fill="#c9ccd1" />
        <rect x={176} y={118} width={36} height={10} rx={2} fill="#fff" opacity={0.35} />
        <path d="M182 134 h24 M182 140 h16" stroke="#8d9096" strokeWidth={1.6} />
      </Part>

      {/* 삼성 DDR5 16GB ×4: 초록 기판과 검은 칩 */}
      {range(4).map((i) => (
        <Part key={i} motion={{ start: 26 + i * 3, dx: 160 + i * 20, dy: -120 + i * 30, rot: 22 - i * 8 }}>
          <rect x={242 + i * 12} y={92} width={10} height={108} rx={1} fill="#1f6b40" />
          {range(4).map((c) => (
            <rect key={c} x={243.5 + i * 12} y={98 + c * 25} width={7} height={18} fill="#16171a" />
          ))}
          <rect x={242 + i * 12} y={92} width={10} height={4} fill="#d4a63b" />
        </Part>
      ))}

      {/* 삼성 980 PRO ×3: 검은 M.2 2280 */}
      {[188, 240, 272].map((y, i) => (
        <Part key={y} motion={{ start: 38 + i * 3, dx: -200, dy: 40 + i * 30, rot: -25 + i * 10 }}>
          <rect x={118} y={y} width={76} height={14} rx={1.5} fill="#0e0f11" />
          <rect x={150} y={y + 2} width={36} height={10} fill="#1d1e22" />
          <path d={`M154 ${y + 5} h20 M154 ${y + 9} h12`} stroke="#e7e7e7" strokeWidth={1.1} />
          <path d={`M124 ${y + 7} h18`} stroke="#ff7a1a" strokeWidth={1.4} />
          <rect x={118} y={y} width={5} height={14} fill="#d4a63b" />
        </Part>
      ))}

      {/* NZXT KRAKEN Z73 RGB: 360mm 라디에이터와 RGB 팬 셋 */}
      <Part motion={{ start: 50, dx: 0, dy: -240, rot: 0 }}>
        <rect x={76} y={0} width={246} height={40} rx={4} fill="#121315" />
        {range(40).map((i) => (
          <rect key={i} x={84 + i * 5.8} y={4} width={1.4} height={32} fill="#26282c" />
        ))}
        {[118, 199, 280].map((cx) => (
          <Fan key={cx} cx={cx} cy={20} r={17} rgb />
        ))}
      </Part>

      {/* KRAKEN 펌프: 둥근 LCD 머리와 라디에이터로 가는 호스 */}
      <Part motion={{ start: 56, dx: 180, dy: -160, rot: 40 }}>
        <path d="M186 110 C 176 70, 150 60, 140 34" fill="none" stroke="#18191c" strokeWidth={7} strokeLinecap="round" />
        <path d="M204 110 C 212 70, 236 60, 248 34" fill="none" stroke="#18191c" strokeWidth={7} strokeLinecap="round" />
        <circle cx={194} cy={134} r={30} fill="#1a1b1e" />
        <circle cx={194} cy={134} r={25} fill="url(#asm-lcd)" />
        <circle cx={194} cy={134} r={18} fill="none" stroke="url(#asm-rgb)" strokeWidth={3} strokeDasharray="70 44" />
        <path d="M186 132 h16 M189 138 h10" stroke="#e8f1ff" strokeWidth={2} strokeLinecap="round" />
        <circle cx={194} cy={134} r={30} fill="none" stroke="#2c2e33" strokeWidth={2} />
      </Part>

      {/* ROG STRIX 라이저 케이블: PCIe 슬롯에서 세로 그래픽카드로 */}
      <Part motion={{ start: 68, dx: -140, dy: 120, rot: -30 }}>
        <path d="M118 218 C 92 222, 82 250, 86 290 L 92 352" fill="none" stroke="#1c1d20" strokeWidth={10} strokeLinejoin="round" />
        <path d="M118 218 C 92 222, 82 250, 86 290 L 92 352" fill="none" stroke="#3a3c42" strokeWidth={10} strokeDasharray="2 6" />
      </Part>

      {/* 쿨러마스터 세로 그래픽카드 거치 키트 V2 */}
      <Part motion={{ start: 71, dx: -180, dy: 60, rot: 18 }}>
        <rect x={66} y={276} width={18} height={104} fill="#26282c" />
        {range(4).map((i) => (
          <rect key={i} x={70} y={284 + i * 22} width={10} height={14} fill="#3b3e44" />
        ))}
        <rect x={66} y={374} width={262} height={8} fill="#2a2c30" />
      </Part>

      {/* ROG STRIX RTX 3090: 세로 장착이라 팬 셋이 앞을 본다 */}
      <Part motion={{ start: 76, dx: 40, dy: 260, rot: -12 }}>
        <rect x={84} y={282} width={238} height={90} rx={6} fill="#24262b" />
        <path d="M84 290 L110 282 H300 L322 296 V364 L300 372 H110 L84 364 Z" fill="#33363c" />
        <path d="M110 282 H300 L322 296" fill="none" stroke="#9aa0a8" strokeWidth={2} />
        <path d="M110 372 H300 L322 364" fill="none" stroke="#9aa0a8" strokeWidth={2} />
        <path d="M88 286 L150 282" stroke="url(#asm-rgb)" strokeWidth={3} strokeLinecap="round" />
        <path d="M262 372 L318 366" stroke="url(#asm-rgb)" strokeWidth={3} strokeLinecap="round" />
        {[134, 203, 272].map((cx) => (
          <Fan key={cx} cx={cx} cy={327} r={31} />
        ))}
      </Part>

      {/* ROG THOR 1200W: 검은 몸체, 옆면 전력 표시창, RGB 띠 */}
      <Part motion={{ start: 84, dx: 220, dy: 160, rot: 16 }}>
        <rect x={150} y={384} width={150} height={22} rx={2} fill="#17181b" />
        <rect x={160} y={388} width={34} height={14} rx={1} fill="#06070a" />
        <path d="M165 395 h8 M176 395 h6 M185 395 h5" stroke="#5ff3ff" strokeWidth={2} />
        <path d="M206 404 L238 386" stroke="url(#asm-rgb)" strokeWidth={3} />
        {range(8).map((i) => (
          <rect key={i} x={248 + i * 6} y={389} width={3} height={12} fill="#2c2e33" />
        ))}
      </Part>
    </svg>
  );
}
