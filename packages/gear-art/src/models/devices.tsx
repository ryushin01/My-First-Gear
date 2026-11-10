import type { ReactNode } from "react";
import { Shadow, range } from "./parts";

/* ───────────── 키보드: 텐키리스, 비스듬히 위에서 ───────────── */

function tklKeyboard(): ReactNode {
  const rows = [
    { n: 13, y: 70, w: 9.6, x: 30 },
    { n: 13, y: 84, w: 9.6, x: 30 },
    { n: 12, y: 96, w: 9.6, x: 34 },
    { n: 11, y: 108, w: 9.6, x: 38 },
    { n: 10, y: 120, w: 9.6, x: 44 },
  ];
  return (
    <g>
      <Shadow cx={100} cy={152} rx={88} ry={7} />
      {/* 알루미늄 하우징: 두께와 윗면 */}
      <path d="M14 70 L186 70 L192 144 L8 144 Z" fill="#2a2c31" />
      <path d="M8 144 L192 144 L190 150 L10 150 Z" fill="#17181b" />
      <path d="M18 62 L182 62 L188 140 L12 140 Z" fill="#3a3d44" />
      <path d="M18 62 L182 62 L183 72 L17 72 Z" fill="#ffffff" opacity={0.14} />
      {/* 키캡 */}
      <rect x={26} y={64} width={9} height={7} rx={1.4} fill="#e2453b" />
      {range(12).map((i) => (
        <rect key={`f${i}`} x={44 + i * 10.6} y={64} width={9} height={7} rx={1.4} fill={i % 4 === 3 ? "#5b5e66" : "#cfd1d4"} />
      ))}
      {rows.map((row, r) =>
        range(row.n).map((i) => {
          const mod = i === 0 || i === row.n - 1;
          return (
            <g key={`${r}-${i}`}>
              <rect x={row.x + i * (row.w + 1.4) - r * 1.2} y={row.y} width={mod ? row.w + 3 : row.w} height={10} rx={1.6} fill={mod ? "#5b5e66" : "#d9dbde"} />
              <rect x={row.x + i * (row.w + 1.4) - r * 1.2} y={row.y} width={mod ? row.w + 3 : row.w} height={3} rx={1.4} fill="#ffffff" opacity={0.35} />
            </g>
          );
        }),
      )}
      {/* 스페이스바 줄 */}
      <rect x={24} y={132} width={12} height={10} rx={1.6} fill="#5b5e66" />
      <rect x={38} y={132} width={12} height={10} rx={1.6} fill="#5b5e66" />
      <rect x={52} y={132} width={66} height={10} rx={1.6} fill="#d9dbde" />
      <rect x={120} y={132} width={12} height={10} rx={1.6} fill="#5b5e66" />
      {/* 방향키·편집키 묶음 */}
      {range(3).map((i) => (
        <rect key={`e${i}`} x={160 + i * 9} y={84} width={8} height={9} rx={1.4} fill="#5b5e66" />
      ))}
      {range(3).map((i) => (
        <rect key={`e2${i}`} x={160 + i * 9} y={96} width={8} height={9} rx={1.4} fill="#5b5e66" />
      ))}
      <rect x={169} y={120} width={8} height={9} rx={1.4} fill="#e2453b" />
      {range(3).map((i) => (
        <rect key={`a${i}`} x={160 + i * 9} y={132} width={8} height={9} rx={1.4} fill="#e2453b" />
      ))}
      {/* USB-C 케이블 */}
      <path d="M100 62 C 100 44, 140 40, 150 20" fill="none" stroke="#e2453b" strokeWidth={3} strokeLinecap="round" />
    </g>
  );
}

/* ───────────── 노트북: 펼친 모습, 약간 비스듬히 ───────────── */

function laptop({ body, deck, screenTone, notch, wide }: { body: string; deck: string; screenTone: [string, string]; notch?: boolean; wide?: boolean }): ReactNode {
  const w = wide ? 156 : 140;
  const x = 100 - w / 2;
  return (
    <g>
      <Shadow cx={100} cy={160} rx={w / 2 + 14} ry={6} />
      {/* 화면 */}
      <rect x={x} y={34} width={w} height={96} rx={6} fill="#0c0c0e" />
      <rect x={x} y={34} width={w} height={96} rx={6} fill="none" stroke={body} strokeWidth={2.5} />
      <rect x={x + 5} y={39} width={w - 10} height={86} rx={2} fill={screenTone[0]} />
      <path d={`M${x + 5} ${39 + 86} C ${x + w * 0.35} ${70}, ${x + w * 0.6} ${110}, ${x + w - 5} ${48} L${x + w - 5} ${125} Z`} fill={screenTone[1]} opacity={0.85} />
      <path d={`M${x + 5} 39 L${x + w * 0.45} 39 L${x + 5} 100 Z`} fill="#ffffff" opacity={0.08} />
      {notch && <rect x={95} y={39} width={10} height={4} rx={1.5} fill="#0c0c0e" />}
      {/* 메뉴 막대 */}
      <rect x={x + 5} y={39} width={w - 10} height={3} fill="#ffffff" opacity={0.18} />
      {/* 본체(위에서 본 키보드 판) */}
      <path d={`M${x - 10} 132 L${x + w + 10} 132 L${x + w + 18} 150 L${x - 18} 150 Z`} fill={deck} />
      <path d={`M${x - 18} 150 L${x + w + 18} 150 L${x + w + 16} 154 L${x - 16} 154 Z`} fill={body} />
      {range(3).map((r) => (
        <rect key={r} x={x + 6 - r * 3} y={134.5 + r * 3.6} width={w - 12 + r * 6} height={2.6} rx={0.8} fill="#1d1e21" opacity={0.85} />
      ))}
      <rect x={88} y={145} width={24} height={4} rx={1} fill="#000" opacity={0.12} />
      <path d={`M${x - 10} 132 L${x + w + 10} 132`} stroke="#ffffff" strokeOpacity={0.4} strokeWidth={1} />
    </g>
  );
}

/* ───────────── DAP ───────────── */

/** 아스텔앤컨: 각진 몸체, 오른쪽에 볼륨 휠을 감싼 비스듬한 가드 */
function astell({ body, edge, screen }: { body: string; edge: string; screen: [string, string] }): ReactNode {
  return (
    <g>
      <Shadow cx={98} cy={182} rx={42} ry={5} />
      <path d="M58 20 L132 20 L140 30 L140 170 L132 178 L58 178 L54 170 L54 28 Z" fill={body} />
      <path d="M58 20 L132 20 L140 30 L136 34 L58 34 Z" fill="#ffffff" opacity={0.3} />
      <path d="M132 178 L140 170 L140 30 L136 34 L136 174 Z" fill="#000" opacity={0.2} />
      {/* 화면 */}
      <rect x={62} y={34} width={70} height={108} rx={2} fill="#08080a" />
      <rect x={65} y={37} width={64} height={102} rx={1} fill={screen[0]} />
      <rect x={72} y={46} width={50} height={50} rx={2} fill={screen[1]} />
      <rect x={72} y={102} width={44} height={3} fill="#ffffff" opacity={0.75} />
      <rect x={72} y={108} width={30} height={2} fill="#ffffff" opacity={0.45} />
      <rect x={72} y={120} width={50} height={2} fill="#ffffff" opacity={0.25} />
      <rect x={72} y={120} width={22} height={2} fill="#ffffff" opacity={0.8} />
      {/* 볼륨 휠과 가드 */}
      <path d="M140 42 L156 50 L156 92 L140 100 Z" fill={edge} />
      <path d="M140 42 L156 50 L156 60 L140 54 Z" fill="#ffffff" opacity={0.25} />
      <rect x={144} y={56} width={8} height={36} rx={2} fill="#2b2b2f" />
      {range(8).map((i) => (
        <rect key={i} x={144} y={58 + i * 4.2} width={8} height={1.2} fill="#8a8d93" />
      ))}
      {/* 아래 버튼 */}
      <circle cx={80} cy={160} r={4} fill={edge} />
      <circle cx={97} cy={160} r={4} fill={edge} />
      <circle cx={114} cy={160} r={4} fill={edge} />
    </g>
  );
}

/** 소니 워크맨: 둥근 모서리 몸체, 위쪽 큰 화면, 오른쪽 옆 버튼 */
function walkman({ body, bodyLight, screen, flagship }: { body: string; bodyLight: string; screen: [string, string]; flagship?: boolean }): ReactNode {
  const w = flagship ? 82 : 66;
  const h = flagship ? 160 : 138;
  const x = 100 - w / 2;
  const y = 100 - h / 2;
  return (
    <g>
      <Shadow cx={100} cy={y + h + 6} rx={w / 2 + 4} ry={5} />
      <rect x={x} y={y} width={w} height={h} rx={12} fill={body} />
      <rect x={x} y={y} width={w * 0.35} height={h} rx={12} fill={bodyLight} opacity={0.55} />
      <rect x={x + w - 6} y={y + 6} width={4} height={h - 12} rx={2} fill="#000" opacity={0.18} />
      {/* 화면 */}
      <rect x={x + 6} y={y + 8} width={w - 12} height={h * 0.62} rx={4} fill="#08080a" />
      <rect x={x + 9} y={y + 11} width={w - 18} height={h * 0.62 - 6} rx={2} fill={screen[0]} />
      <rect x={x + 16} y={y + 20} width={w - 32} height={w - 32} rx={2} fill={screen[1]} />
      <rect x={x + 16} y={y + 26 + (w - 32)} width={w - 40} height={3} fill="#ffffff" opacity={0.75} />
      <rect x={x + 16} y={y + 33 + (w - 32)} width={w - 52} height={2} fill="#ffffff" opacity={0.45} />
      {/* 아래 가로줄 장식 */}
      {flagship && range(3).map((i) => <rect key={i} x={x + 14} y={y + h * 0.74 + i * 6} width={w - 28} height={1.2} fill="#000" opacity={0.18} />)}
      {/* 옆 버튼 */}
      {range(4).map((i) => (
        <rect key={i} x={x + w - 1} y={y + 30 + i * 14} width={4} height={9} rx={1.5} fill={bodyLight} />
      ))}
      {/* 위 단자 */}
      <circle cx={x + w * 0.35} cy={y - 1} r={3} fill="#1a1a1c" />
      {flagship && <circle cx={x + w * 0.6} cy={y - 1} r={3.6} fill="#1a1a1c" />}
    </g>
  );
}

/* ───────────── 이어폰 ───────────── */

function wf1000xm5(): ReactNode {
  const bud = (cx: number, flip: boolean) => (
    <g transform={flip ? `scale(-1 1) translate(${-2 * cx} 0)` : undefined}>
      <ellipse cx={cx} cy={78} rx={24} ry={26} fill="#1c1c1e" />
      <ellipse cx={cx - 6} cy={70} rx={12} ry={10} fill="#ffffff" opacity={0.12} />
      <circle cx={cx + 2} cy={80} r={11} fill="#2a2a2d" />
      <circle cx={cx + 2} cy={80} r={11} fill="none" stroke="#b08d5b" strokeWidth={1.2} />
      <ellipse cx={cx + 20} cy={92} rx={9} ry={7} fill="#3a3a3e" />
    </g>
  );
  return (
    <g>
      <Shadow cx={100} cy={176} rx={56} ry={5} />
      {/* 케이스 */}
      <rect x={52} y={118} width={96} height={52} rx={26} fill="#1e1e20" />
      <rect x={52} y={118} width={96} height={20} rx={20} fill="#ffffff" opacity={0.08} />
      <path d="M54 140 H146" stroke="#0e0e10" strokeWidth={1.4} />
      <circle cx={100} cy={152} r={2} fill="#3ddc84" />
      {bud(66, false)}
      {bud(134, true)}
    </g>
  );
}

function blessing3(): ReactNode {
  const shell = (cx: number, flip: boolean) => (
    <g transform={flip ? `scale(-1 1) translate(${-2 * cx} 0)` : undefined}>
      <path d={`M${cx - 28} 62 C ${cx - 34} 30, ${cx + 22} 24, ${cx + 30} 52 C ${cx + 36} 76, ${cx + 10} 104, ${cx - 14} 96 C ${cx - 26} 92, ${cx - 26} 80, ${cx - 28} 62 Z`} fill="#3a7bd5" opacity={0.92} />
      <path d={`M${cx - 20} 58 C ${cx - 22} 38, ${cx + 14} 34, ${cx + 22} 52 C ${cx + 26} 70, ${cx + 6} 88, ${cx - 10} 84 Z`} fill="#c9ccd1" />
      {/* 금속 페이스플레이트의 무늬 */}
      {range(5).map((i) => (
        <path key={i} d={`M${cx - 16 + i * 6} 44 C ${cx - 10 + i * 6} 56, ${cx - 20 + i * 6} 70, ${cx - 12 + i * 6} 82`} fill="none" stroke="#8d9198" strokeWidth={1.4} />
      ))}
      <path d={`M${cx - 20} 58 C ${cx - 22} 38, ${cx + 14} 34, ${cx + 22} 52 L${cx - 12} 60 Z`} fill="#ffffff" opacity={0.25} />
      {/* 2핀 케이블 */}
      <path d={`M${cx + 24} 40 C ${cx + 40} 20, ${cx + 8} 8, ${cx - 4} 22`} fill="none" stroke="#c9ccd1" strokeWidth={2} />
      <path d={`M${cx - 14} 96 C ${cx - 10} 130, ${cx + 10} 150, ${100 - cx + cx} 172`} fill="none" stroke="#c9ccd1" strokeWidth={2} />
    </g>
  );
  return (
    <g>
      <Shadow cx={100} cy={178} rx={50} ry={4} />
      {shell(60, false)}
      {shell(140, true)}
    </g>
  );
}

/* ───────────── 헤드폰 ───────────── */

function hd600(): ReactNode {
  return (
    <g>
      <Shadow cx={100} cy={182} rx={70} ry={5} />
      {/* 갈라진 헤드밴드 */}
      <path d="M40 104 C 40 32, 160 32, 160 104" fill="none" stroke="#1d1d20" strokeWidth={8} />
      <path d="M58 64 C 76 46, 124 46, 142 64" fill="none" stroke="#2a2a2e" strokeWidth={10} strokeLinecap="round" />
      <path d="M58 64 C 76 46, 124 46, 142 64" fill="none" stroke="#3a3a40" strokeWidth={2} strokeDasharray="2 3" />
      {/* 슬라이더 */}
      <rect x={34} y={96} width={12} height={22} rx={3} fill="#2a2a2e" />
      <rect x={154} y={96} width={12} height={22} rx={3} fill="#2a2a2e" />
      {[40, 160].map((cx) => (
        <g key={cx}>
          {/* 파란 마블 컵 */}
          <ellipse cx={cx} cy={140} rx={28} ry={36} fill="#2b3a55" />
          <path d={`M${cx - 24} 128 C ${cx - 10} 120, ${cx} 140, ${cx + 22} 126`} fill="none" stroke="#4d6282" strokeWidth={4} opacity={0.8} />
          <path d={`M${cx - 20} 154 C ${cx - 6} 146, ${cx + 6} 162, ${cx + 22} 150`} fill="none" stroke="#3e5272" strokeWidth={5} opacity={0.8} />
          {/* 은색 그릴 */}
          <ellipse cx={cx} cy={140} rx={19} ry={26} fill="#a7abb2" />
          {range(9).map((i) => (
            <rect key={i} x={cx - 17} y={118 + i * 5} width={34} height={1.6} fill="#5d6168" />
          ))}
          <ellipse cx={cx - 6} cy={128} rx={8} ry={10} fill="#ffffff" opacity={0.25} />
        </g>
      ))}
    </g>
  );
}

function wh1000xm6(): ReactNode {
  return (
    <g>
      <Shadow cx={100} cy={182} rx={68} ry={5} />
      <path d="M44 112 C 40 30, 160 30, 156 112" fill="none" stroke="#2a2a2d" strokeWidth={12} strokeLinecap="round" />
      <path d="M48 100 C 46 42, 154 42, 152 100" fill="none" stroke="#ffffff" strokeOpacity={0.08} strokeWidth={3} />
      {[44, 156].map((cx) => (
        <g key={cx}>
          <rect x={cx - 6} y={100} width={12} height={18} rx={4} fill="#1f1f22" />
          <ellipse cx={cx} cy={146} rx={27} ry={34} fill="#232326" />
          <ellipse cx={cx - 7} cy={134} rx={12} ry={15} fill="#ffffff" opacity={0.08} />
          <ellipse cx={cx} cy={146} rx={27} ry={34} fill="none" stroke="#b08d5b" strokeWidth={1} opacity={0.6} />
          <circle cx={cx} cy={174} r={1.8} fill="#4a4a4f" />
        </g>
      ))}
    </g>
  );
}

/* ───────────── 게임기 ───────────── */

function switch2(): ReactNode {
  return (
    <g>
      <Shadow cx={100} cy={146} rx={92} ry={6} />
      {/* 본체 */}
      <rect x={42} y={58} width={116} height={78} rx={5} fill="#1a1a1c" />
      <rect x={47} y={63} width={106} height={68} rx={2} fill="#0a0a0c" />
      <rect x={49} y={65} width={102} height={64} rx={1} fill="#3b2a6b" />
      <path d="M49 129 C 80 90, 110 120, 151 74 L151 129 Z" fill="#e2453b" opacity={0.7} />
      <path d="M49 65 L95 65 L49 110 Z" fill="#ffffff" opacity={0.07} />
      {/* 조이콘 2: 검정, 안쪽 레일 쪽 색 띠 */}
      <rect x={12} y={58} width={32} height={78} rx={14} fill="#1c1c1f" />
      <rect x={40} y={60} width={3} height={74} rx={1.5} fill="#3f8cff" />
      <rect x={156} y={58} width={32} height={78} rx={14} fill="#1c1c1f" />
      <rect x={157} y={60} width={3} height={74} rx={1.5} fill="#ff4b4b" />
      {/* 왼쪽 스틱과 방향 버튼 */}
      <circle cx={28} cy={80} r={8} fill="#2b2b2f" />
      <circle cx={28} cy={80} r={5} fill="#141416" />
      {[[28, 104], [22, 110], [34, 110], [28, 116]].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={3} fill="#2b2b2f" />
      ))}
      {/* 오른쪽 버튼과 스틱 */}
      {[[172, 74], [166, 80], [178, 80], [172, 86]].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={3} fill="#2b2b2f" />
      ))}
      <circle cx={172} cy={110} r={8} fill="#2b2b2f" />
      <circle cx={172} cy={110} r={5} fill="#141416" />
      <rect x={168} y={124} width={8} height={3} rx={1} fill="#2b2b2f" />
    </g>
  );
}

function ps5Pro(): ReactNode {
  return (
    <g>
      <Shadow cx={100} cy={186} rx={44} ry={5} />
      {/* 가운데 검정 코어 */}
      <path d="M86 18 L116 18 L118 178 L84 178 Z" fill="#141416" />
      {/* 흰 패널 (곡선) */}
      <path d="M86 18 C 66 30, 60 100, 70 176 L86 178 Z" fill="#f2f2f4" />
      <path d="M116 18 C 136 30, 142 100, 132 176 L118 178 Z" fill="#e4e5e8" />
      <path d="M86 18 C 70 34, 66 70, 68 110 L80 110 C 78 70, 80 40, 86 18 Z" fill="#ffffff" opacity={0.6} />
      {/* 프로의 검정 줄 세 개 */}
      {[70, 96, 122].map((y) => (
        <g key={y}>
          <path d={`M66 ${y} L86 ${y + 4} L86 ${y + 8} L66 ${y + 4} Z`} fill="#141416" />
          <path d={`M118 ${y + 4} L136 ${y} L136 ${y + 4} L118 ${y + 8} Z`} fill="#141416" />
        </g>
      ))}
      {/* 앞 단자 */}
      <rect x={96} y={130} width={10} height={4} rx={1} fill="#2c2c30" />
      <rect x={96} y={140} width={10} height={4} rx={1} fill="#2c2c30" />
      <rect x={99} y={24} width={4} height={2} rx={1} fill="#3db8ff" />
    </g>
  );
}

/* ───────────── 게이밍 모니터 ───────────── */

function monitor({
  w,
  h,
  curve,
  bezel,
  stand,
  screen,
  base,
  y = 30,
}: {
  w: number;
  h: number;
  curve: number;
  bezel: string;
  stand: string;
  screen: [string, string, string];
  base: "v" | "plate" | "tripod";
  y?: number;
}): ReactNode {
  const x = 100 - w / 2;
  const top = `M${x} ${y + curve} Q 100 ${y - curve} ${x + w} ${y + curve}`;
  const bottom = `L${x + w} ${y + h + curve} Q 100 ${y + h - curve} ${x} ${y + h + curve} Z`;
  return (
    <g>
      <Shadow cx={100} cy={176} rx={Math.min(90, w / 2)} ry={5} />
      {/* 스탠드 */}
      <rect x={94} y={y + h + 2} width={12} height={176 - (y + h + 2) - 8} fill={stand} />
      <rect x={94} y={y + h + 2} width={4} height={176 - (y + h + 2) - 8} fill="#ffffff" opacity={0.15} />
      {base === "v" && <path d="M100 166 L60 176 L66 178 L100 170 L134 178 L140 176 Z" fill={stand} />}
      {base === "plate" && <ellipse cx={100} cy={172} rx={36} ry={6} fill={stand} />}
      {base === "tripod" && <path d="M100 164 L58 178 M100 164 L142 178 M100 164 L100 178" stroke={stand} strokeWidth={5} strokeLinecap="round" />}
      {/* 화면 */}
      <path d={`${top} ${bottom}`} fill={bezel} />
      <path
        d={`M${x + 3} ${y + curve + 3} Q 100 ${y - curve + 3} ${x + w - 3} ${y + curve + 3} L${x + w - 3} ${y + h + curve - 4} Q 100 ${y + h - curve - 4} ${x + 3} ${y + h + curve - 4} Z`}
        fill={screen[0]}
      />
      {/* 게임 장면 느낌의 빛 */}
      <path d={`M${x + 3} ${y + h * 0.7 + curve} Q ${100 - w * 0.2} ${y + h * 0.35} 100 ${y + h * 0.55} T ${x + w - 3} ${y + h * 0.4 + curve} L${x + w - 3} ${y + h + curve - 4} Q 100 ${y + h - curve - 4} ${x + 3} ${y + h + curve - 4} Z`} fill={screen[1]} opacity={0.85} />
      <path d={`M${x + w * 0.55} ${y + h * 0.2} l8 0 l-4 6 Z`} fill={screen[2]} />
      <circle cx={x + w * 0.3} cy={y + h * 0.35} r={Math.min(8, h * 0.12)} fill={screen[2]} opacity={0.9} />
      <path d={`M${x + 3} ${y + curve + 3} Q 100 ${y - curve + 3} ${x + w * 0.45} ${y + curve * 0.4 + 3} L${x + 3} ${y + h * 0.6} Z`} fill="#ffffff" opacity={0.06} />
      {/* 아래 테두리 */}
      <path d={`M${x} ${y + h + curve} Q 100 ${y + h - curve} ${x + w} ${y + h + curve}`} fill="none" stroke={bezel} strokeWidth={3} />
    </g>
  );
}

export const deviceModels: Record<string, () => ReactNode> = {
  "phoenix-keyboard": tklKeyboard,
  "macbook-air-13-m4": () => laptop({ body: "#a9c4d8", deck: "#bcd3e3", screenTone: ["#1c2c4c", "#5f8fd6"], notch: true }),
  "lg-gram-16": () => laptop({ body: "#d4d6da", deck: "#e1e3e6", screenTone: ["#14243a", "#c94d6a"], wide: true }),
  "astell-kern-sp3000": () => astell({ body: "#c3c6cc", edge: "#9da1a8", screen: ["#111318", "#c78f3a"] }),
  "astell-kern-a-norma-sr35": () => astell({ body: "#3b3e45", edge: "#5b5f68", screen: ["#111318", "#3d78c9"] }),
  "sony-nw-wm1zm2": () => walkman({ body: "#c59a52", bodyLight: "#e8c98c", screen: ["#101216", "#7a5a2e"], flagship: true }),
  "sony-nw-a306": () => walkman({ body: "#2f5d8c", bodyLight: "#5d8fc4", screen: ["#101216", "#2d6fb3"] }),
  "sony-wf-1000xm5": wf1000xm5,
  "moondrop-blessing-3": blessing3,
  "sennheiser-hd-600": hd600,
  "sony-wh-1000xm6": wh1000xm6,
  "nintendo-switch-2": switch2,
  "playstation-5-pro": ps5Pro,
  "samsung-odyssey-oled-g9": () =>
    monitor({ w: 196, h: 56, curve: 9, bezel: "#d9dbdf", stand: "#c3c6cc", screen: ["#0b1020", "#7b3fe4", "#ff9f1c"], base: "v", y: 58 }),
  "lg-ultragear-oled-32gs95ue": () =>
    monitor({ w: 156, h: 90, curve: 0, bezel: "#141416", stand: "#2a2b30", screen: ["#08121c", "#d6283c", "#ffe66d"], base: "plate" }),
  "asus-rog-swift-oled-pg27ucdm": () =>
    monitor({ w: 136, h: 78, curve: 0, bezel: "#18181b", stand: "#2e2f34", screen: ["#0a0f1e", "#00c2a8", "#ff4fd8"], base: "tripod", y: 40 }),
  "alienware-aw3423dwf": () =>
    monitor({ w: 176, h: 76, curve: 6, bezel: "#1b1c20", stand: "#2b2c31", screen: ["#050810", "#2e7dff", "#7dff6a"], base: "v", y: 42 }),
};
