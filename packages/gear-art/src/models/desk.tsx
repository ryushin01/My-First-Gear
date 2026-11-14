import type { ReactNode } from "react";
import { monitor } from "./devices";
import { Perforation, Shadow, range } from "./parts";

/* 데스크 셋업 장비. 로고, 상표 문양, 글자는 그리지 않는다. */

/* ───────────── 의자 (정면에서 약간 위) ───────────── */

function base5(color: string, y = 166): ReactNode {
  return (
    <g>
      <Shadow cx={100} cy={y + 12} rx={60} ry={5} />
      {[-58, -30, 0, 30, 58].map((dx) => (
        <path key={dx} d={`M100 ${y - 6} L${100 + dx} ${y + (Math.abs(dx) > 40 ? 2 : 8)}`} stroke={color} strokeWidth={6} strokeLinecap="round" />
      ))}
      {[-58, -30, 0, 30, 58].map((dx) => (
        <circle key={`w${dx}`} cx={100 + dx} cy={y + (Math.abs(dx) > 40 ? 7 : 13)} r={4} fill="#151517" />
      ))}
      <rect x={96} y={y - 30} width={8} height={26} rx={2} fill="#2b2b2f" />
      <rect x={97} y={y - 30} width={2} height={26} fill="#ffffff" opacity={0.25} />
    </g>
  );
}

function aeron(): ReactNode {
  const frame = "#2c2d31";
  return (
    <g>
      {base5("#3a3b40")}
      {/* 등판: 아래가 좁고 위가 넓은 그물망 */}
      <path d="M58 22 C 80 14, 120 14, 142 22 L134 104 C 120 110, 80 110, 66 104 Z" fill={frame} />
      <path d="M63 27 C 82 20, 118 20, 137 27 L130 100 C 118 105, 82 105, 70 100 Z" fill="#45474d" />
      {range(18).map((i) => (
        <path key={`v${i}`} d={`M${66 + i * 4} ${24 - (i > 3 && i < 14 ? 3 : 0)} L${72 + i * 3.3} 103`} stroke="#2a2b2f" strokeWidth={0.8} />
      ))}
      {range(14).map((i) => (
        <path key={`h${i}`} d={`M${63 + i * 0.5} ${30 + i * 5} H${137 - i * 0.5}`} stroke="#2a2b2f" strokeWidth={0.6} opacity={0.8} />
      ))}
      {/* 포스처핏 허리 받침 */}
      <path d="M72 86 C 86 92, 114 92, 128 86 L127 96 C 114 101, 86 101, 73 96 Z" fill="#1f2023" />
      {/* 등판 옆 기둥 */}
      <path d="M62 60 L56 112 L66 118" fill="none" stroke={frame} strokeWidth={5} strokeLinecap="round" />
      <path d="M138 60 L144 112 L134 118" fill="none" stroke={frame} strokeWidth={5} strokeLinecap="round" />
      {/* 좌판 */}
      <path d="M58 112 C 70 104, 130 104, 142 112 L138 130 C 120 138, 80 138, 62 130 Z" fill={frame} />
      <path d="M62 113 C 74 107, 126 107, 138 113 L135 126 C 118 133, 82 133, 65 126 Z" fill="#4a4c52" />
      {range(10).map((i) => (
        <path key={`s${i}`} d={`M${66 + i * 7} 110 L${68 + i * 6.6} 130`} stroke="#2f3034" strokeWidth={0.7} />
      ))}
      {/* 팔걸이 */}
      <path d="M44 100 h22 l-2 8 h-18 Z" fill="#1d1e21" />
      <path d="M54 108 V132" stroke={frame} strokeWidth={5} />
      <path d="M134 100 h22 l-2 8 h-18 Z" fill="#1d1e21" />
      <path d="M146 108 V132" stroke={frame} strokeWidth={5} />
      <rect x={86} y={134} width={28} height={6} rx={2} fill="#1d1e21" />
    </g>
  );
}

function t50Air(): ReactNode {
  return (
    <g>
      {base5("#c9ccd1")}
      {/* 헤드레스트 */}
      <rect x={72} y={14} width={56} height={18} rx={8} fill="#3a3c42" />
      <rect x={97} y={30} width={6} height={14} fill="#c9ccd1" />
      {/* 등판: 흰 프레임 + 회색 메시 */}
      <path d="M62 42 C 80 36, 120 36, 138 42 L134 108 C 120 114, 80 114, 66 108 Z" fill="#e6e7ea" />
      <path d="M68 47 C 84 42, 116 42, 132 47 L128 104 C 116 108, 84 108, 72 104 Z" fill="#6b6f77" />
      <Perforation x={70} y={46} w={60} h={58} gap={3.2} r={0.7} fill="#3c3f45" opacity={0.7} />
      <path d="M74 86 C 88 92, 112 92, 126 86 L125 94 C 112 99, 88 99, 75 94 Z" fill="#4c5058" />
      {/* 좌판 */}
      <path d="M56 116 C 70 108, 130 108, 144 116 L140 134 C 120 142, 80 142, 60 134 Z" fill="#3a3c42" />
      <path d="M60 117 C 74 111, 126 111, 140 117 L138 122 C 120 118, 80 118, 62 122 Z" fill="#ffffff" opacity={0.12} />
      {/* 팔걸이 */}
      <rect x={42} y={98} width={20} height={7} rx={3} fill="#2b2c30" />
      <path d="M52 105 V130" stroke="#c9ccd1" strokeWidth={5} />
      <rect x={138} y={98} width={20} height={7} rx={3} fill="#2b2c30" />
      <path d="M148 105 V130" stroke="#c9ccd1" strokeWidth={5} />
    </g>
  );
}

function titanEvo(): ReactNode {
  return (
    <g>
      {base5("#232326")}
      {/* 레이싱 의자 등판: 날개가 있는 높은 등판 */}
      <path d="M66 8 C 80 2, 120 2, 134 8 L136 40 C 146 46, 148 60, 140 70 L138 112 L62 112 L60 70 C 52 60, 54 46, 64 40 Z" fill="#1c1c1f" />
      <path d="M78 14 C 90 10, 110 10, 122 14 L124 108 L76 108 Z" fill="#2a2a2e" />
      {/* 퀼팅 줄 */}
      {range(6).map((i) => (
        <path key={i} d={`M78 ${30 + i * 13} H122`} stroke="#141416" strokeWidth={1} />
      ))}
      <path d="M78 14 L76 108 M122 14 L124 108" stroke="#c9a227" strokeWidth={1} strokeDasharray="2 2" opacity={0.7} />
      {/* 머리 쿠션 */}
      <rect x={80} y={18} width={40} height={14} rx={6} fill="#141416" />
      {/* 어깨 구멍 */}
      <rect x={72} y={36} width={8} height={14} rx={3} fill="#0b0b0c" />
      <rect x={120} y={36} width={8} height={14} rx={3} fill="#0b0b0c" />
      <path d="M66 8 C 80 2, 120 2, 134 8 L134 14 C 120 8, 80 8, 66 14 Z" fill="#ffffff" opacity={0.1} />
      {/* 좌판 */}
      <path d="M54 114 C 70 106, 130 106, 146 114 L142 134 C 120 142, 80 142, 58 134 Z" fill="#1c1c1f" />
      <path d="M66 112 h68 v20 h-68 Z" fill="#2a2a2e" />
      {/* 4D 팔걸이 */}
      <rect x={40} y={96} width={20} height={8} rx={3} fill="#2b2b2f" />
      <path d="M50 104 V132" stroke="#2b2b2f" strokeWidth={6} />
      <rect x={140} y={96} width={20} height={8} rx={3} fill="#2b2b2f" />
      <path d="M150 104 V132" stroke="#2b2b2f" strokeWidth={6} />
    </g>
  );
}

function omni(): ReactNode {
  return (
    <g>
      {base5("#2b2c30")}
      {/* 발받침 */}
      <rect x={70} y={150} width={60} height={8} rx={3} fill="#2f3036" />
      {/* 척추 마디 등판 */}
      <path d="M64 18 C 82 10, 118 10, 136 18 L132 106 C 118 112, 82 112, 68 106 Z" fill="#1d1e22" />
      <path d="M70 22 C 84 16, 116 16, 130 22 L126 102 C 116 106, 84 106, 74 102 Z" fill="#3a3c43" />
      {range(9).map((i) => (
        <rect key={i} x={95} y={22 + i * 9} width={10} height={6} rx={2} fill="#3d6fd8" opacity={0.85 - i * 0.05} />
      ))}
      {range(8).map((i) => (
        <path key={`m${i}`} d={`M72 ${28 + i * 10} H93 M107 ${28 + i * 10} H128`} stroke="#2a2b30" strokeWidth={1.2} />
      ))}
      {/* 헤드레스트 */}
      <path d="M78 4 C 90 0, 110 0, 122 4 L120 14 L80 14 Z" fill="#2a2b30" />
      {/* 좌판 */}
      <path d="M56 114 C 70 106, 130 106, 144 114 L140 134 C 120 142, 80 142, 60 134 Z" fill="#26272c" />
      <path d="M60 115 C 74 109, 126 109, 140 115 L138 120 C 120 116, 80 116, 62 120 Z" fill="#ffffff" opacity={0.1} />
      <rect x={40} y={96} width={22} height={8} rx={3} fill="#1d1e22" />
      <path d="M51 104 V132" stroke="#2b2c30" strokeWidth={5} />
      <rect x={138} y={96} width={22} height={8} rx={3} fill="#1d1e22" />
      <path d="M149 104 V132" stroke="#2b2c30" strokeWidth={5} />
    </g>
  );
}

/* ───────────── 책상 (비스듬히 앞에서) ───────────── */

function desk({
  top,
  topEdge,
  frame,
  grain,
  rounded,
  tray,
}: {
  top: string;
  topEdge: string;
  frame: string;
  grain?: string;
  rounded?: boolean;
  tray?: boolean;
}): ReactNode {
  const r = rounded ? 10 : 2;
  return (
    <g>
      <Shadow cx={100} cy={170} rx={92} ry={6} />
      {/* 다리: 기둥 + 발 */}
      {[40, 160].map((x) => (
        <g key={x}>
          <rect x={x - 6} y={86} width={12} height={78} fill={frame} />
          <rect x={x - 6} y={86} width={4} height={78} fill="#ffffff" opacity={0.15} />
          <rect x={x - 10} y={118} width={20} height={46} fill={frame} opacity={0.9} />
          <rect x={x - 24} y={162} width={48} height={7} rx={3} fill={frame} />
        </g>
      ))}
      {/* 가로 지지대 */}
      <rect x={40} y={90} width={120} height={7} fill={frame} />
      {tray && <path d="M50 92 H150 L146 108 H54 Z" fill={frame} opacity={0.85} />}
      {/* 상판 */}
      <path d={`M${14 + r} 58 H${186 - r} Q186 58 188 62 L196 80 Q197 84 192 84 H8 Q3 84 4 80 L12 62 Q14 58 ${14 + r} 58 Z`} fill={top} />
      <rect x={4} y={84} width={192} height={6} rx={2} fill={topEdge} />
      {grain &&
        range(6).map((i) => (
          <path
            key={i}
            d={`M${18 + i * 4} ${62 + i * 3.4} C 70 ${60 + i * 3.4}, 120 ${66 + i * 3.4}, ${184 - i * 2} ${62 + i * 3.4}`}
            fill="none"
            stroke={grain}
            strokeWidth={0.8}
            opacity={0.6}
          />
        ))}
      <path d="M14 60 H186 L188 64 H12 Z" fill="#ffffff" opacity={0.18} />
      {/* 높이 조절 버튼 */}
      <rect x={150} y={90} width={22} height={6} rx={2} fill="#1a1a1c" />
      <circle cx={156} cy={93} r={1.2} fill="#7dff6a" />
    </g>
  );
}

/* ───────────── 모니터암 (뒤에서 비스듬히) ───────────── */

function arm({ color, light, dual, long }: { color: string; light: string; dual?: boolean; long?: boolean }): ReactNode {
  const screen = (x: number) => (
    <g>
      <path d={`M${x} 26 L${x + 54} 32 L${x + 54} 96 L${x} 102 Z`} fill="#141416" />
      <path d={`M${x + 3} 30 L${x + 51} 35 L${x + 51} 93 L${x + 3} 98 Z`} fill="#1f2024" />
      <rect x={x + 22} y={56} width={12} height={12} fill={color} />
    </g>
  );
  return (
    <g>
      <Shadow cx={100} cy={176} rx={80} ry={4} />
      {/* 책상 모서리와 클램프 */}
      <path d="M10 150 H190 L196 160 H4 Z" fill="#6b4a32" />
      <rect x={4} y={160} width={192} height={6} fill="#4a3322" />
      <rect x={88} y={142} width={24} height={10} rx={2} fill={color} />
      <path d="M90 166 h20 v12 h-20 Z" fill={color} />
      {/* 기둥 */}
      <rect x={95} y={long ? 70 : 60} width={10} height={84} rx={3} fill={color} />
      <rect x={96} y={long ? 70 : 60} width={3} height={84} fill={light} opacity={0.6} />
      {dual ? (
        <g>
          {screen(8)}
          {screen(138)}
          {[
            [100, 66, 68, 72],
            [100, 66, 132, 72],
          ].map(([x1, y1, x2, y2]) => (
            <g key={x2}>
              <path d={`M${x1} ${y1} L${x2} ${y2}`} stroke={color} strokeWidth={8} strokeLinecap="round" />
              <path d={`M${x1} ${y1 - 2} L${x2} ${y2 - 2}`} stroke={light} strokeWidth={1.5} opacity={0.6} />
              <circle cx={x2} cy={y2} r={5} fill={light} />
            </g>
          ))}
          <path d="M68 72 L62 66" stroke={color} strokeWidth={6} />
          <path d="M132 72 L138 66" stroke={color} strokeWidth={6} />
        </g>
      ) : (
        <g>
          {screen(124)}
          <path
            d={`M100 ${long ? 74 : 64} L${long ? 70 : 76} ${long ? 52 : 46} L130 60`}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={`M100 ${long ? 72 : 62} L${long ? 70 : 76} ${long ? 50 : 44} L130 58`}
            fill="none"
            stroke={light}
            strokeWidth={1.6}
            opacity={0.6}
          />
          <circle cx={long ? 70 : 76} cy={long ? 52 : 46} r={5} fill={light} />
          <circle cx={100} cy={long ? 74 : 64} r={6} fill={light} />
        </g>
      )}
    </g>
  );
}

/* ───────────── 조명 ───────────── */

function screenbarHalo(): ReactNode {
  return (
    <g>
      <Shadow cx={100} cy={172} rx={90} ry={4} />
      {/* 책상 위로 떨어지는 빛 */}
      <path d="M40 46 L18 166 H182 L160 46 Z" fill="#f5e7c4" opacity={0.12} />
      <ellipse cx={100} cy={160} rx={80} ry={10} fill="#f5e7c4" opacity={0.18} />
      {/* 모니터 위쪽과 뒤쪽 간접광 */}
      <rect x={20} y={46} width={160} height={84} rx={3} fill="#121316" />
      <rect x={24} y={50} width={152} height={76} fill="#1b2433" />
      <path d="M24 126 C 70 96, 120 116, 176 80 V126 Z" fill="#2d3d58" />
      {/* 스크린바 본체 */}
      <rect x={36} y={34} width={128} height={9} rx={4.5} fill="#2b2c30" />
      <rect x={36} y={34} width={128} height={3} rx={1.5} fill="#ffffff" opacity={0.2} />
      <rect x={44} y={42} width={112} height={2} fill="#fff6dc" />
      <path d="M92 42 h16 l-2 8 h-12 Z" fill="#2b2c30" />
      {/* 무선 다이얼 */}
      <ellipse cx={162} cy={160} rx={16} ry={6} fill="#1a1a1c" />
      <rect x={146} y={148} width={32} height={12} fill="#2b2c30" />
      <ellipse cx={162} cy={148} rx={16} ry={6} fill="#3a3b40" />
      <ellipse cx={162} cy={148} rx={10} ry={3.6} fill="#fff6dc" opacity={0.5} />
    </g>
  );
}

function signeFloor(): ReactNode {
  const colors = ["#ffcf5a", "#ff9a4a", "#ff6b6b", "#e24bb3", "#8a5cf5", "#4b7bff"];
  return (
    <g>
      {/* 벽에 번지는 빛 */}
      <ellipse cx={112} cy={70} rx={56} ry={70} fill="#ff6b6b" opacity={0.1} />
      <ellipse cx={112} cy={40} rx={40} ry={36} fill="#ffcf5a" opacity={0.1} />
      <ellipse cx={112} cy={120} rx={40} ry={40} fill="#8a5cf5" opacity={0.12} />
      <Shadow cx={100} cy={180} rx={30} ry={4} />
      {/* 막대 */}
      {colors.map((c, i) => (
        <rect key={c} x={97} y={10 + i * 24} width={6} height={25} fill={c} />
      ))}
      <rect x={95} y={8} width={10} height={150} rx={5} fill="none" stroke="#f2f2f2" strokeWidth={1} opacity={0.5} />
      <rect x={98.5} y={158} width={3} height={14} fill="#c3c6cc" />
      {/* 둥근 받침 */}
      <ellipse cx={100} cy={174} rx={22} ry={5} fill="#d9dbdf" />
      <ellipse cx={100} cy={172} rx={22} ry={5} fill="#eceef0" />
    </g>
  );
}

function playBars(): ReactNode {
  return (
    <g>
      <Shadow cx={100} cy={170} rx={90} ry={4} />
      {/* 벽의 색 */}
      <ellipse cx={34} cy={84} rx={40} ry={66} fill="#7b3fe4" opacity={0.22} />
      <ellipse cx={166} cy={84} rx={40} ry={66} fill="#ff3fa4" opacity={0.22} />
      {/* 모니터 뒷모습 */}
      <rect x={42} y={40} width={116} height={72} rx={3} fill="#151518" />
      <rect x={94} y={112} width={12} height={48} fill="#2b2c30" />
      <path d="M70 166 L100 156 L130 166" stroke="#2b2c30" strokeWidth={5} />
      {/* 막대 조명 두 개 */}
      {[
        [24, "#a675ff"],
        [166, "#ff6fbf"],
      ].map(([x, c]) => (
        <g key={x as number}>
          <rect x={x as number} y={92} width={10} height={70} rx={2} fill="#1b1b1d" />
          <rect x={(x as number) + 2} y={94} width={6} height={64} rx={1} fill={c as string} />
          <rect x={(x as number) - 4} y={160} width={18} height={6} rx={2} fill="#1b1b1d" />
        </g>
      ))}
    </g>
  );
}

function nanoleafLines(): ReactNode {
  const segs: [number, number, number, number, string][] = [
    [40, 120, 70, 68, "#00c2a8"],
    [70, 68, 130, 68, "#2e7dff"],
    [130, 68, 160, 120, "#7b3fe4"],
    [160, 120, 130, 172, "#ff3fa4"],
    [70, 68, 100, 120, "#00e0ff"],
    [100, 120, 130, 68, "#ff9f1c"],
    [100, 120, 40, 120, "#3ddc84"],
    [100, 120, 160, 120, "#ff5a5a"],
    [70, 172, 100, 120, "#ffd23f"],
  ];
  return (
    <g>
      <rect x={0} y={0} width={200} height={200} fill="#0d0f14" opacity={0.4} />
      {segs.map(([x1, y1, x2, y2, c], i) => (
        <g key={i}>
          <path d={`M${x1} ${y1} L${x2} ${y2}`} stroke={c} strokeWidth={14} opacity={0.18} strokeLinecap="round" />
          <path d={`M${x1} ${y1} L${x2} ${y2}`} stroke={c} strokeWidth={4} strokeLinecap="round" />
        </g>
      ))}
      {[
        [40, 120],
        [70, 68],
        [130, 68],
        [160, 120],
        [100, 120],
        [130, 172],
        [70, 172],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={4.5} fill="#e9e9ec" />
      ))}
    </g>
  );
}

/* ───────────── 마우스 (위에서) ───────────── */

function mouse({
  body,
  shine = 0.18,
  shape,
  side,
  rgb,
  wheel = "#2b2b2f",
  ambi,
}: {
  body: string;
  shine?: number;
  shape: "sym" | "ergo" | "master" | "g502";
  side?: string;
  rgb?: boolean;
  wheel?: string;
  /** 좌우 양쪽에 옆 버튼이 있는 양손 마우스 */
  ambi?: boolean;
}): ReactNode {
  const outline = {
    sym: "M100 26 C 130 26, 140 56, 140 96 C 140 140, 126 172, 100 172 C 74 172, 60 140, 60 96 C 60 56, 70 26, 100 26 Z",
    ergo: "M96 24 C 128 22, 142 52, 144 90 C 146 130, 132 172, 104 174 C 76 176, 62 150, 58 120 C 56 100, 66 90, 64 70 C 62 40, 74 26, 96 24 Z",
    master: "M100 22 C 132 22, 146 54, 146 98 C 146 138, 130 168, 106 172 C 84 176, 66 162, 52 140 C 44 126, 50 112, 60 104 C 58 60, 70 22, 100 22 Z",
    g502: "M94 20 C 124 18, 140 40, 142 70 L148 92 C 150 130, 134 170, 104 174 C 80 176, 62 160, 56 130 L50 108 C 48 96, 58 90, 60 76 C 60 40, 70 22, 94 20 Z",
  }[shape];
  return (
    <g>
      <Shadow cx={102} cy={178} rx={42} ry={5} />
      <path d={outline} fill={body} />
      <ellipse cx={86} cy={70} rx={16} ry={34} fill="#ffffff" opacity={shine} />
      <path d={outline} fill="none" stroke="#9a9ea5" strokeWidth={1.4} opacity={0.45} />
      <path d="M72 50 C 76 36, 88 30, 98 30" fill="none" stroke="#ffffff" strokeWidth={2.4} strokeLinecap="round" opacity={0.35} />
      {/* 왼쪽·오른쪽 버튼 가르는 선 */}
      <path d="M100 26 V84" stroke="#000" strokeWidth={1.2} opacity={0.4} />
      <path
        d={`M${shape === "master" ? 64 : 62} 84 C 80 90, 120 90, ${shape === "master" ? 144 : 140} 84`}
        fill="none"
        stroke="#000"
        strokeWidth={1}
        opacity={0.25}
      />
      {/* 휠 */}
      <rect x={95} y={42} width={10} height={24} rx={5} fill={wheel} />
      {range(5).map((i) => (
        <rect key={i} x={95} y={45 + i * 4.4} width={10} height={1.2} fill="#000" opacity={0.4} />
      ))}
      {shape === "master" && (
        <g>
          <rect x={98} y={72} width={4} height={8} rx={1.5} fill="#1c1c1f" />
          {/* 엄지 받침과 엄지 휠 */}
          <path d="M60 104 C 46 114, 44 130, 52 140 L66 132 C 62 122, 64 112, 70 106 Z" fill="#000" opacity={0.25} />
          <rect x={54} y={108} width={8} height={16} rx={3} fill={wheel} transform="rotate(-20 58 116)" />
        </g>
      )}
      {side && (
        <g>
          <rect x={56} y={92} width={6} height={14} rx={2} fill={side} />
          <rect x={56} y={110} width={6} height={14} rx={2} fill={side} />
          {ambi && <rect x={138} y={92} width={6} height={14} rx={2} fill={side} />}
          {ambi && <rect x={138} y={110} width={6} height={14} rx={2} fill={side} />}
        </g>
      )}
      {shape === "g502" && (
        <g>
          <path d="M66 46 L80 40 L84 58 L70 62 Z" fill="#2b2b2f" />
          <path d="M134 46 L120 40 L116 58 L130 62 Z" fill="#2b2b2f" />
          <rect x={92} y={70} width={16} height={6} rx={2} fill="#2b2b2f" />
        </g>
      )}
      {rgb && <path d="M76 150 C 90 160, 110 160, 124 150" fill="none" stroke="#ff3fa4" strokeWidth={3} strokeLinecap="round" />}
      {rgb && <path d="M70 140 C 74 146, 76 148, 78 150" stroke="#00e0ff" strokeWidth={3} strokeLinecap="round" />}
    </g>
  );
}

/* ───────────── 키보드 (비스듬히 위에서) ───────────── */

function keyboard({
  cols,
  rows = 5,
  fn = true,
  nav,
  numpad,
  body,
  cap,
  mod,
  accent,
  accentKeys = [],
  thin,
  knob,
  leds,
  round,
  halfFn,
  touchId,
  hhkb,
}: {
  cols: number;
  rows?: number;
  fn?: boolean;
  nav?: boolean;
  numpad?: boolean;
  body: string;
  cap: string;
  mod: string;
  accent?: string;
  accentKeys?: number[];
  thin?: boolean;
  knob?: string;
  /** 오른쪽 위 표시등 색 (리얼포스 등) */
  leds?: string;
  /** 오목하게 파인 둥근 키 (MX Keys) */
  round?: boolean;
  /** 높이가 반인 기능키 줄 (애플 매직 키보드) */
  halfFn?: boolean;
  /** 오른쪽 위 Touch ID 키 */
  touchId?: boolean;
  /** 해피해킹 배열: 맨 아랫줄 양 끝이 비어 있다 */
  hhkb?: boolean;
}): ReactNode {
  const keyW = numpad ? 8.2 : nav ? 9.4 : 10.4;
  const gap = 1.2;
  const mainW = cols * (keyW + gap);
  const navW = nav ? 3 * (keyW + gap) + 4 : 0;
  const padW = numpad ? 4 * (keyW + gap) + 4 : 0;
  const total = mainW + navW + padW + 12;
  const x0 = 100 - total / 2;
  const allRows = rows + (fn ? 1 : 0);
  const kh = 10;
  const y0 = 100 - (allRows * (kh + gap)) / 2;
  const h = allRows * (kh + gap) + 10;
  let n = 0;
  const key = (x: number, y: number, w: number, isMod: boolean, keyH = kh) => {
    const idx = n++;
    const fill = accent && accentKeys.includes(idx) ? accent : isMod ? mod : cap;
    return (
      <g key={idx}>
        <rect x={x} y={y} width={w} height={keyH} rx={thin ? 1 : 1.6} fill={fill} />
        {!thin && <rect x={x + 0.8} y={y + 0.6} width={w - 1.6} height={keyH * 0.55} rx={1.2} fill="#ffffff" opacity={0.18} />}
        {round && <ellipse cx={x + w / 2} cy={y + keyH / 2} rx={Math.min(w, 9) * 0.36} ry={keyH * 0.32} fill="#000" opacity={0.22} />}
      </g>
    );
  };
  const keys: ReactNode[] = [];
  for (let r = 0; r < allRows; r++) {
    const y = y0 + r * (kh + gap);
    const last = r === allRows - 1;
    if (last && hhkb) {
      // 빈칸 · Alt · ◆ · 스페이스 · ◆ · Alt · 빈칸
      const side = keyW * 1.5 + gap;
      const m = keyW * 1.2;
      let x = x0 + 6 + side;
      keys.push(key(x, y, m, true));
      x += m + gap;
      keys.push(key(x, y, m, true));
      x += m + gap;
      const space = mainW - 2 * side - 4 * (m + gap) - gap;
      keys.push(key(x, y, space, false));
      x += space + gap;
      keys.push(key(x, y, m, true));
      x += m + gap;
      keys.push(key(x, y, m, true));
    } else if (fn && halfFn && r === 0) {
      for (let c = 0; c < cols; c++) keys.push(key(x0 + 6 + c * (keyW + gap), y + kh / 2, keyW, c === 0, kh / 2));
      if (touchId)
        keys.push(
          <circle
            key="touch-id"
            cx={x0 + 6 + (cols - 1) * (keyW + gap) + keyW / 2}
            cy={y + kh * 0.75}
            r={kh * 0.18}
            fill="none"
            stroke="#9a9ea5"
            strokeWidth={0.8}
          />,
        );
    } else if (last) {
      keys.push(key(x0 + 6, y, keyW * 1.3, true));
      keys.push(key(x0 + 6 + keyW * 1.3 + gap, y, keyW * 1.3, true));
      keys.push(key(x0 + 6 + 2 * (keyW * 1.3 + gap), y, mainW - 4 * (keyW * 1.3 + gap) - gap, false));
      keys.push(key(x0 + 6 + mainW - 2 * (keyW * 1.3 + gap), y, keyW * 1.3, true));
      keys.push(key(x0 + 6 + mainW - (keyW * 1.3 + gap), y, keyW * 1.3 - gap, true));
    } else {
      for (let c = 0; c < cols; c++) {
        const isMod = c === 0 || c === cols - 1 || (fn && r === 0 && c % 4 === 0);
        keys.push(key(x0 + 6 + c * (keyW + gap), y, keyW, isMod));
      }
    }
    if (nav && (r < 3 || last || r === allRows - 2)) {
      const nx = x0 + 6 + mainW + 4;
      if (r === allRows - 2) keys.push(key(nx + keyW + gap, y, keyW, true));
      else for (let c = 0; c < 3; c++) keys.push(key(nx + c * (keyW + gap), y, keyW, true));
    }
    if (numpad && r > 0) {
      const px = x0 + 6 + mainW + navW + 4;
      for (let c = 0; c < 4; c++) keys.push(key(px + c * (keyW + gap), y, keyW, c === 3));
    }
  }
  return (
    <g>
      <Shadow cx={100} cy={y0 + h + 6} rx={total / 2 + 4} ry={5} />
      <rect x={x0} y={y0 - 6 + (thin ? 2 : 0)} width={total} height={h + (thin ? 0 : 4)} rx={thin ? 4 : 5} fill="#000" opacity={0.35} />
      <rect x={x0} y={y0 - 6} width={total} height={h} rx={thin ? 4 : 5} fill={body} />
      <rect x={x0} y={y0 - 6} width={total} height={3} rx={2} fill="#ffffff" opacity={0.2} />
      {keys}
      {knob && <circle cx={x0 + total - 10} cy={y0 - 1} r={4.5} fill={knob} stroke="#000" strokeOpacity={0.3} />}
      {leds &&
        [0, 1, 2].map((i) => <circle key={`led${i}`} cx={x0 + total - 22 + i * 6} cy={y0 - 2.5} r={1.3} fill={leds} opacity={i === 0 ? 1 : 0.35} />)}
    </g>
  );
}

/* ───────────── 스피커 (정면) ───────────── */

function driver(cx: number, cy: number, r: number, cone: string, ring = "#111", dust = "#1b1b1d"): ReactNode {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={ring} />
      <circle cx={cx} cy={cy} r={r * 0.86} fill={cone} />
      <circle cx={cx - r * 0.2} cy={cy - r * 0.2} r={r * 0.5} fill="#ffffff" opacity={0.08} />
      <circle cx={cx} cy={cy} r={r * 0.32} fill={dust} />
    </g>
  );
}

function bookshelfPair({
  w,
  h,
  body,
  edge,
  woofer,
  coax,
  tweeter = true,
  extra,
  radius = 4,
  single,
}: {
  w: number;
  h: number;
  body: string;
  edge: string;
  woofer: string;
  coax?: string;
  tweeter?: boolean;
  extra?: (x: number, y: number) => ReactNode;
  radius?: number;
  single?: boolean;
}): ReactNode {
  const y = 176 - h;
  const xs = single ? [100 - w / 2] : [100 - w - 8, 108];
  return (
    <g>
      <Shadow cx={100} cy={178} rx={single ? w / 2 + 10 : w + 20} ry={5} />
      {xs.map((x) => (
        <g key={x}>
          <rect x={x} y={y} width={w} height={h} rx={radius} fill={body} />
          <rect x={x} y={y} width={w * 0.18} height={h} rx={radius} fill="#ffffff" opacity={0.1} />
          <rect x={x + w - 4} y={y} width={4} height={h} fill="#000" opacity={0.15} />
          <rect x={x} y={y} width={w} height={3} rx={radius} fill="#ffffff" opacity={0.15} />
          <rect x={x} y={y + h - 3} width={w} height={3} fill={edge} />
          {coax ? (
            <g>
              {driver(x + w / 2, y + h * 0.38, w * 0.36, woofer)}
              <circle cx={x + w / 2} cy={y + h * 0.38} r={w * 0.14} fill={coax} />
              <circle cx={x + w / 2} cy={y + h * 0.38} r={w * 0.06} fill="#0d0d0e" opacity={0.5} />
            </g>
          ) : (
            <g>
              {tweeter && (
                <g>
                  <circle cx={x + w / 2} cy={y + h * 0.22} r={w * 0.16} fill="#0f0f10" />
                  <circle cx={x + w / 2} cy={y + h * 0.22} r={w * 0.08} fill="#4a4c52" />
                </g>
              )}
              {driver(x + w / 2, y + h * 0.62, w * 0.34, woofer)}
            </g>
          )}
          {extra?.(x, y)}
        </g>
      ))}
    </g>
  );
}

function pebble(): ReactNode {
  return (
    <g>
      <Shadow cx={100} cy={160} rx={80} ry={5} />
      {[52, 148].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={118} r={36} fill="#ececea" />
          <circle cx={cx - 10} cy={106} r={18} fill="#ffffff" opacity={0.5} />
          <ellipse cx={cx} cy={150} rx={26} ry={6} fill="#c9c9c6" />
          {/* 45° 위를 보는 드라이버 */}
          <ellipse cx={cx} cy={108} rx={20} ry={15} fill="#6d6f74" transform={`rotate(${cx < 100 ? 10 : -10} ${cx} 108)`} />
          <ellipse cx={cx} cy={108} rx={7} ry={5.5} fill="#3a3b40" transform={`rotate(${cx < 100 ? 10 : -10} ${cx} 108)`} />
        </g>
      ))}
    </g>
  );
}

function acton(): ReactNode {
  return (
    <g>
      <Shadow cx={100} cy={170} rx={80} ry={5} />
      <rect x={24} y={52} width={152} height={114} rx={6} fill="#1b1b1c" />
      {/* 가죽 질감 */}
      <Perforation x={26} y={54} w={148} h={110} gap={4} r={0.5} fill="#3a3a3c" opacity={0.6} />
      {/* 그릴 + 흰 테두리 */}
      <rect x={34} y={74} width={132} height={82} rx={4} fill="#262628" />
      <rect x={34} y={74} width={132} height={82} rx={4} fill="none" stroke="#e9e6dc" strokeWidth={1.4} />
      {range(16).map((i) => (
        <path key={i} d={`M36 ${78 + i * 5} H164`} stroke="#141415" strokeWidth={1.4} />
      ))}
      {/* 위쪽 황동 조작부 */}
      <rect x={110} y={56} width={60} height={14} rx={2} fill="#b8912f" />
      {[118, 132, 146, 160].map((x) => (
        <g key={x}>
          <circle cx={x} cy={63} r={4.5} fill="#d9b45a" />
          <circle cx={x} cy={63} r={4.5} fill="none" stroke="#7a5d1a" strokeWidth={0.8} />
        </g>
      ))}
    </g>
  );
}

function genelec(): ReactNode {
  return (
    <g>
      <Shadow cx={100} cy={176} rx={44} ry={5} />
      {/* 둥근 알루미늄 몸체 */}
      <path d="M62 30 C 62 20, 138 20, 138 30 L140 150 C 140 166, 60 166, 60 150 Z" fill="#4f5257" />
      <path d="M62 30 C 62 20, 100 20, 100 22 L92 162 C 76 160, 60 158, 60 150 Z" fill="#ffffff" opacity={0.1} />
      {/* 웨이브가이드 */}
      <ellipse cx={100} cy={64} rx={30} ry={26} fill="#3b3d42" />
      <ellipse cx={100} cy={64} rx={18} ry={15} fill="#2b2c30" />
      <circle cx={100} cy={64} r={7} fill="#8d9097" />
      {driver(100, 118, 28, "#2a2b2f")}
      {/* 앞쪽 포트와 표시등 */}
      <rect x={84} y={152} width={32} height={4} rx={2} fill="#1d1e21" />
      <circle cx={130} cy={150} r={1.6} fill="#3ddc84" />
      {/* 받침(이소포드) */}
      <path d="M78 162 L72 176 H128 L122 162 Z" fill="#2f3135" />
    </g>
  );
}

/* ───────────── 마이크 ───────────── */

function wave3(): ReactNode {
  return (
    <g>
      <Shadow cx={100} cy={180} rx={40} ry={4} />
      {/* 받침 */}
      <ellipse cx={100} cy={174} rx={36} ry={7} fill="#1b1b1d" />
      <rect x={96} y={130} width={8} height={44} fill="#26272b" />
      <path d="M82 132 H118 L114 120 H86 Z" fill="#26272b" />
      {/* 몸체 */}
      <rect x={74} y={20} width={52} height={114} rx={22} fill="#1d1e21" />
      <rect x={76} y={22} width={14} height={110} rx={7} fill="#ffffff" opacity={0.08} />
      {/* 그릴 */}
      <rect x={78} y={24} width={44} height={46} rx={20} fill="#2c2d31" />
      <Perforation x={80} y={28} w={40} h={40} gap={3} r={0.7} fill="#0b0b0c" opacity={0.9} />
      {/* 다이얼과 음소거 */}
      <circle cx={100} cy={96} r={11} fill="#2c2d31" />
      <circle cx={100} cy={96} r={8} fill="#1a1a1c" />
      <path d="M93 104 A 11 11 0 0 1 93 88" fill="none" stroke="#3ddc84" strokeWidth={2} />
      <rect x={94} y={78} width={12} height={4} rx={2} fill="#e8463b" />
    </g>
  );
}

function seirenMini(): ReactNode {
  return (
    <g>
      <Shadow cx={100} cy={176} rx={34} ry={4} />
      <ellipse cx={100} cy={170} rx={30} ry={7} fill="#e6e6e3" />
      <ellipse cx={100} cy={168} rx={30} ry={7} fill="#f4f4f2" />
      <rect x={97} y={136} width={6} height={32} fill="#d9d9d6" />
      <rect x={76} y={36} width={48} height={104} rx={18} fill="#f2f2f0" />
      <rect x={78} y={38} width={12} height={100} rx={6} fill="#ffffff" opacity={0.6} />
      <rect x={80} y={42} width={40} height={60} rx={16} fill="#d7d7d3" />
      <Perforation x={82} y={46} w={36} h={52} gap={3} r={0.7} fill="#9a9a96" opacity={0.9} />
      <rect x={90} y={30} width={20} height={8} rx={4} fill="#1fd655" />
    </g>
  );
}

/* ───────────── 헤드셋·헤드폰 ───────────── */

function arctisNova(): ReactNode {
  return (
    <g>
      <Shadow cx={100} cy={182} rx={66} ry={5} />
      {/* 철제 밴드와 스키 고글 끈 */}
      <path d="M46 110 C 40 26, 160 26, 154 110" fill="none" stroke="#2a2b2f" strokeWidth={6} />
      <path d="M60 70 C 76 52, 124 52, 140 70" fill="none" stroke="#141416" strokeWidth={12} strokeLinecap="round" />
      {[46, 154].map((cx) => (
        <g key={cx}>
          <rect x={cx - 4} y={98} width={8} height={18} rx={3} fill="#3a3b40" />
          <ellipse cx={cx} cy={146} rx={26} ry={34} fill="#1a1a1d" />
          <ellipse cx={cx} cy={146} rx={20} ry={27} fill="#232428" />
          <ellipse cx={cx - 6} cy={134} rx={9} ry={12} fill="#ffffff" opacity={0.07} />
          {/* 빛나는 띠 */}
          <ellipse cx={cx} cy={146} rx={23} ry={30.5} fill="none" stroke="#ff7a1a" strokeWidth={1.2} opacity={0.75} />
        </g>
      ))}
      {/* 수납형 마이크 끝 */}
      <rect x={26} y={160} width={10} height={4} rx={2} fill="#3a3b40" />
    </g>
  );
}

function dt900(): ReactNode {
  return (
    <g>
      <Shadow cx={100} cy={182} rx={70} ry={5} />
      <path d="M42 106 C 38 28, 162 28, 158 106" fill="none" stroke="#1d1d20" strokeWidth={10} strokeLinecap="round" />
      <path d="M48 96 C 46 40, 154 40, 152 96" fill="none" stroke="#3a3a3f" strokeWidth={2} strokeDasharray="3 3" />
      {[42, 158].map((cx) => (
        <g key={cx}>
          <path d={`M${cx - 10} 104 L${cx - 18} 118 M${cx + 10} 104 L${cx + 18} 118`} stroke="#8d9097" strokeWidth={2.5} />
          {/* 벨루어 패드 */}
          <circle cx={cx} cy={144} r={30} fill="#2a2a2e" />
          {/* 오픈형 그릴 */}
          <circle cx={cx} cy={144} r={23} fill="#141416" />
          {range(9).map((i) => (
            <path key={i} d={`M${cx - 20} ${126 + i * 4.5} H${cx + 20}`} stroke="#4a4b50" strokeWidth={1.4} />
          ))}
          <circle cx={cx} cy={144} r={23} fill="none" stroke="#55575d" strokeWidth={1.4} />
          <circle cx={cx - 8} cy={134} r={8} fill="#ffffff" opacity={0.06} />
        </g>
      ))}
      <rect x={20} y={164} width={7} height={10} rx={2} fill="#3a3b40" />
    </g>
  );
}

/* ───────────── 스팀덱 OLED ───────────── */

function steamDeck(): ReactNode {
  return (
    <g>
      <Shadow cx={100} cy={150} rx={94} ry={6} />
      <path
        d="M8 76 C 8 58, 22 52, 36 52 H164 C 178 52, 192 58, 192 76 L196 118 C 198 136, 186 146, 170 142 L150 136 H50 L30 142 C 14 146, 2 136, 4 118 Z"
        fill="#1c1c1f"
      />
      <path
        d="M8 76 C 8 58, 22 52, 36 52 H164 C 178 52, 192 58, 192 76 L190 72 C 186 62, 176 58, 164 58 H36 C 24 58, 14 62, 10 72 Z"
        fill="#ffffff"
        opacity={0.08}
      />
      {/* OLED 화면 */}
      <rect x={52} y={58} width={96} height={60} rx={3} fill="#09090b" />
      <rect x={55} y={61} width={90} height={54} rx={1} fill="#122033" />
      <path d="M55 115 C 80 84, 110 108, 145 72 V115 Z" fill="#1a9fff" opacity={0.8} />
      <path d="M55 61 H96 L55 100 Z" fill="#ffffff" opacity={0.06} />
      {/* 왼쪽: 방향키, 스틱, 트랙패드 */}
      <path d="M26 68 h6 v6 h6 v6 h-6 v6 h-6 v-6 h-6 v-6 h6 Z" fill="#2b2b2f" />
      <circle cx={40} cy={98} r={9} fill="#2b2b2f" />
      <circle cx={40} cy={98} r={6} fill="#141416" />
      <rect x={24} y={112} width={22} height={22} rx={5} fill="#252528" />
      {/* 오른쪽: ABXY, 스틱, 트랙패드 */}
      {[
        [170, 64],
        [164, 70],
        [176, 70],
        [170, 76],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={3} fill="#2b2b2f" />
      ))}
      <circle cx={160} cy={98} r={9} fill="#2b2b2f" />
      <circle cx={160} cy={98} r={6} fill="#141416" />
      <rect x={154} y={112} width={22} height={22} rx={5} fill="#252528" />
      <rect x={48} y={124} width={8} height={4} rx={1} fill="#2b2b2f" />
      <rect x={144} y={124} width={8} height={4} rx={1} fill="#2b2b2f" />
    </g>
  );
}

export const deskModels: Record<string, () => ReactNode> = {
  "herman-miller-aeron": aeron,
  "sidiz-t50-air": t50Air,
  "secretlab-titan-evo": titanEvo,
  "libernovo-omni": omni,

  "secretlab-magnus-pro": () => desk({ top: "#2b2c30", topEdge: "#1b1b1d", frame: "#1f2023", tray: true }),
  "desker-motion-desk-1600": () => desk({ top: "#f2f0ea", topEdge: "#d8d5cc", frame: "#e6e6e3" }),
  "linak-dl6-dual-motor": () => desk({ top: "#6b4a32", topEdge: "#4a3322", frame: "#1f2023", grain: "#4a3322" }),
  "maywood-homage-motion-desk": () => desk({ top: "#c08a52", topEdge: "#94663a", frame: "#232326", grain: "#94663a", rounded: true }),

  "camelmount-cma-2p": () => arm({ color: "#1f2023", light: "#55575d", dual: true }),
  "ergotron-lx": () => arm({ color: "#b9bdc3", light: "#f2f3f5", long: true }),
  "fellowes-flex-1fm": () => arm({ color: "#232326", light: "#4a4b50" }),

  "benq-screenbar-halo-2": screenbarHalo,
  "philips-hue-gradient-signe-floor": signeFloor,
  "philips-hue-play-light-bar": playBars,
  "nanoleaf-lines": nanoleafLines,

  "logitech-g-pro-x-superlight-2": () => mouse({ body: "#1d1d20", shape: "sym", side: "#2b2b2f" }),
  "logitech-mx-master-3s": () => mouse({ body: "#3a3c42", shape: "master", wheel: "#8d9097" }),
  "logitech-g502-x-plus": () => mouse({ body: "#1b1b1d", shape: "g502", side: "#2b2b2f", rgb: true }),
  "logitech-g903-hero": () => mouse({ body: "#1b1b1d", shape: "sym", side: "#3a3b40", wheel: "#8d9097", ambi: true }),
  "razer-viper-v2-pro": () => mouse({ body: "#efefed", shine: 0.35, shape: "sym", side: "#d9d9d6", wheel: "#c9c9c6" }),
  "razer-deathadder-v3-pro": () => mouse({ body: "#18181a", shape: "ergo", side: "#2b2b2f" }),

  "logitech-g-pro-x-tkl-rapid": () => keyboard({ cols: 13, nav: true, body: "#1b1b1d", cap: "#2a2b2f", mod: "#222326", knob: "#3a3b40" }),
  "nuphy-air75-v3": () =>
    keyboard({ cols: 14, body: "#c9ccd1", cap: "#e9e9e6", mod: "#8d9097", accent: "#ff7a1a", accentKeys: [0, 13, 70], thin: true, knob: "#ff7a1a" }),
  "realforce-r3-tkl": () => keyboard({ cols: 13, nav: true, body: "#1a1a1c", cap: "#2b2c30", mod: "#232427", leds: "#3ddc84" }),
  "hhkb-professional-hybrid-type-s-snow": () => keyboard({ cols: 15, fn: false, body: "#d6d6cf", cap: "#fbfbf8", mod: "#ecece5", hhkb: true }),
  "leopold-fc750r-pd": () => keyboard({ cols: 13, nav: true, body: "#4a4c52", cap: "#c9cbcf", mod: "#5b6f8a", accent: "#c4302b", accentKeys: [0] }),
  "logitech-mx-keys-s": () =>
    keyboard({ cols: 12, nav: true, numpad: true, thin: true, round: true, body: "#3a3c42", cap: "#232427", mod: "#232427" }),
  "apple-magic-keyboard-touch-id": () =>
    keyboard({ cols: 14, thin: true, halfFn: true, touchId: true, body: "#d9dbdf", cap: "#f8f8f6", mod: "#f8f8f6" }),
  "leopold-fc660mbt": () => keyboard({ cols: 15, fn: false, body: "#3a3b40", cap: "#dcd9d2", mod: "#9c9a94", accent: "#c4302b", accentKeys: [0] }),
  "corsair-k70-rgb-pro": () => keyboard({ cols: 12, nav: true, numpad: true, body: "#d9dbdf", cap: "#f4f4f2", mod: "#e1e2e4", knob: "#9aa0a6" }),

  "kef-lsx-ii": () => bookshelfPair({ w: 54, h: 92, body: "#2e5f80", edge: "#1d3e55", woofer: "#c3c6cc", coax: "#e7c46a", radius: 6 }),
  "kef-r3-meta": () =>
    bookshelfPair({
      w: 62,
      h: 130,
      body: "#c9ccd1",
      edge: "#9aa0a6",
      woofer: "#d9dbdf",
      coax: "#9aa0a6",
      extra: (x, y) => driver(x + 31, y + 96, 22, "#b4b8be"),
    }),
  "edifier-mr4": () => bookshelfPair({ w: 54, h: 88, body: "#f2f2f0", edge: "#d9d9d6", woofer: "#2b2c30" }),
  "edifier-qr65": () =>
    bookshelfPair({
      w: 56,
      h: 96,
      body: "#1b1b1d",
      edge: "#0d0d0e",
      woofer: "#2b2c30",
      radius: 14,
      extra: (x, y) => <rect x={x + 6} y={y + 86} width={44} height={3} rx={1.5} fill="#d6283c" />,
    }),
  "audioengine-a2-plus-wireless": () => bookshelfPair({ w: 46, h: 72, body: "#c4302b", edge: "#8f1f1b", woofer: "#d8d6d0" }),
  "creative-pebble-v3": pebble,
  "marshall-acton-iii": acton,
  "genelec-8020d": genelec,

  "elgato-wave-3": wave3,
  "razer-seiren-v3-mini": seirenMini,

  "samsung-odyssey-oled-g8-g80sd": () =>
    monitor({ w: 156, h: 88, curve: 0, bezel: "#c9ccd1", stand: "#c9ccd1", screen: ["#0b1020", "#3d78c9", "#ffd23f"], base: "plate", y: 34 }),
  "samsung-odyssey-neo-g7-43": () =>
    monitor({ w: 190, h: 106, curve: 0, bezel: "#141416", stand: "#2a2b30", screen: ["#120b20", "#ff9f1c", "#3ddc84"], base: "v", y: 24 }),
  "alienware-aw2725df": () =>
    monitor({ w: 140, h: 80, curve: 0, bezel: "#1b1c20", stand: "#e6e7ea", screen: ["#050810", "#7dff6a", "#2e7dff"], base: "tripod", y: 40 }),

  "steelseries-arctis-nova-pro-wireless": arctisNova,
  "beyerdynamic-dt-900-pro-x": dt900,
  "steam-deck-oled": steamDeck,
};
