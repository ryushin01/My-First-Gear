import type { ReactNode } from "react";
import { Fan, Metal, Perforation, Shadow, range } from "./parts";
import { antecTorque } from "./torque";

/* ───────────── CPU: 위에서 본 모습 ───────────── */

/** AM5 CPU: 초록 기판 위 니켈 도금 히트스프레더, 가장자리의 홈(문어발) 사이로 보이는 커패시터 */
function am5(label: string): ReactNode {
  return (
    <g>
      <Shadow cx={100} cy={170} rx={62} ry={6} />
      <rect x={38} y={38} width={124} height={124} rx={6} fill="#1f5a3a" />
      <rect x={38} y={38} width={124} height={124} rx={6} fill="none" stroke="#2f7a52" strokeWidth={1.5} />
      {/* 홈 사이 커패시터 */}
      {range(4).map((i) => (
        <g key={i}>
          <rect x={60 + i * 22} y={44} width={6} height={4} fill="#b8862b" />
          <rect x={60 + i * 22} y={152} width={6} height={4} fill="#b8862b" />
        </g>
      ))}
      {/* 히트스프레더: 가장자리에 홈이 패인 모양 */}
      <path
        d="M50 50 H74 V60 H86 V50 H114 V60 H126 V50 H150 V74 H140 V86 H150 V114 H140 V126 H150 V150 H126 V140 H114 V150 H86 V140 H74 V150 H50 V126 H60 V114 H50 V86 H60 V74 H50 Z"
        fill="#c9ccd1"
      />
      <path d="M50 50 H150 V74 H140 V86 H150 V96 H50 Z" fill="#ffffff" opacity={0.22} />
      <path d="M50 120 H60 V126 H50 Z M50 126 V150 H74 V140 H86 V150 H114 V140 H126 V150 H150 V126 H140 V120 Z" fill="#000" opacity={0.12} />
      <rect x={64} y={64} width={72} height={72} rx={3} fill="#d9dce0" />
      <rect x={64} y={64} width={72} height={20} rx={3} fill="#ffffff" opacity={0.35} />
      {/* 각인 글자 자리 (로고 대신 줄) */}
      <rect x={74} y={92} width={52} height={3} fill="#8d9096" />
      <rect x={74} y={100} width={36} height={3} fill="#8d9096" />
      <rect x={74} y={112} width={44} height={2} fill="#a2a5ab" />
      <rect x={74} y={124} width={label.length * 4} height={2} fill="#a2a5ab" />
      {/* 1번 핀 표시 */}
      <path d="M41 159 L41 150 L50 159 Z" fill="#e3b341" />
    </g>
  );
}

/** LGA1851 CPU: 세로로 긴 초록 기판, 직사각형 히트스프레더, 금색 삼각 표시 */
function lga1851(): ReactNode {
  return (
    <g>
      <Shadow cx={100} cy={176} rx={52} ry={6} />
      <rect x={52} y={26} width={96} height={148} rx={5} fill="#16583c" />
      <rect x={52} y={26} width={96} height={148} rx={5} fill="none" stroke="#2c7d55" strokeWidth={1.5} />
      {range(10).map((i) => (
        <rect key={i} x={58 + i * 8.6} y={30} width={4} height={3} fill="#c69a3a" />
      ))}
      {range(10).map((i) => (
        <rect key={`b${i}`} x={58 + i * 8.6} y={167} width={4} height={3} fill="#c69a3a" />
      ))}
      <rect x={62} y={50} width={76} height={104} rx={4} fill="#c3c7cd" />
      <rect x={62} y={50} width={76} height={36} rx={4} fill="#ffffff" opacity={0.3} />
      <rect x={62} y={124} width={76} height={30} rx={4} fill="#000" opacity={0.1} />
      <rect x={72} y={96} width={56} height={3} fill="#878a90" />
      <rect x={72} y={104} width={40} height={3} fill="#878a90" />
      <rect x={72} y={116} width={48} height={2} fill="#9da0a6" />
      <path d="M55 171 L55 160 L66 171 Z" fill="#e8b84a" />
      {/* 노치 */}
      <rect x={48} y={64} width={6} height={10} fill="#0d0d0e" />
      <rect x={146} y={64} width={6} height={10} fill="#0d0d0e" />
    </g>
  );
}

/* ───────────── 메인보드: 위에서 본 모습 ───────────── */

type BoardStyle = {
  pcb: string;
  heatsink: string;
  heatsinkLight: string;
  accent: string;
  /** M-ATX면 짧다 */
  matx?: boolean;
  wifi?: boolean;
};

function board({ pcb, heatsink, heatsinkLight, accent, matx, wifi }: BoardStyle): ReactNode {
  const h = matx ? 150 : 172;
  const top = matx ? 25 : 14;
  return (
    <g>
      <Shadow cx={100} cy={top + h + 6} rx={74} ry={5} />
      <rect x={26} y={top} width={148} height={h} rx={3} fill={pcb} />
      {/* 회로 무늬 */}
      {range(9).map((i) => (
        <path key={i} d={`M30 ${top + 20 + i * 16} h${40 + (i % 3) * 20}`} stroke="#ffffff" strokeOpacity={0.05} strokeWidth={1} />
      ))}
      {/* 후면 단자 덮개(I/O 슈라우드) + 전원부 방열판 */}
      <Metal x={28} y={top + 4} w={30} h={58} r={3} base={heatsink} light={heatsinkLight} />
      <Metal x={60} y={top + 4} w={56} h={16} r={3} base={heatsink} light={heatsinkLight} />
      {range(6).map((i) => (
        <rect key={i} x={30} y={top + 10 + i * 8} width={26} height={1.5} fill="#000" opacity={0.25} />
      ))}
      <rect x={28} y={top + 30} width={30} height={3} fill={accent} />
      {/* 소켓 */}
      <rect x={66} y={top + 28} width={44} height={44} rx={2} fill="#2a2b2f" />
      <rect x={70} y={top + 32} width={36} height={36} rx={1} fill="#b8bcc2" />
      <rect x={70} y={top + 32} width={36} height={12} fill="#ffffff" opacity={0.3} />
      <rect x={108} y={top + 34} width={4} height={30} fill="#9a9ea5" />
      {/* 메모리 슬롯 4개 */}
      {range(4).map((i) => (
        <g key={i}>
          <rect x={122 + i * 9} y={top + 10} width={6} height={74} rx={1} fill={i % 2 ? "#3a3b40" : "#5a5c63"} />
          <rect x={122 + i * 9} y={top + 10} width={6} height={4} fill="#c8cbd0" />
          <rect x={122 + i * 9} y={top + 80} width={6} height={4} fill="#c8cbd0" />
        </g>
      ))}
      {/* 24핀 전원 */}
      <rect x={160} y={top + 92} width={10} height={30} rx={1} fill="#1b1b1d" />
      {/* M.2 방열판 */}
      <Metal x={44} y={top + 82} w={76} h={12} r={2} base={heatsink} light={heatsinkLight} />
      <rect x={44} y={top + 86} width={76} height={2} fill={accent} opacity={0.9} />
      {/* PCIe x16 슬롯 (금속 보강) */}
      <rect x={34} y={top + 102} width={104} height={8} rx={1} fill="#c3c6cc" />
      <rect x={36} y={top + 104} width={100} height={4} fill="#2c2d31" />
      <rect x={34} y={top + (matx ? 128 : 136)} width={60} height={6} rx={1} fill="#3a3b40" />
      {!matx && <rect x={34} y={top + 156} width={104} height={6} rx={1} fill="#3a3b40" />}
      {/* 칩셋 방열판 */}
      <Metal x={118} y={top + (matx ? 118 : 124)} w={44} h={matx ? 26 : 40} r={4} base={heatsink} light={heatsinkLight} />
      <path d={`M122 ${top + (matx ? 126 : 136)} l36 0`} stroke={accent} strokeWidth={2} />
      {/* 커패시터·초크 */}
      {range(5).map((i) => (
        <rect key={i} x={62 + i * 9} y={top + 76} width={6} height={4} rx={1} fill="#2e2f33" />
      ))}
      {wifi && (
        <g>
          <rect x={28} y={top + 66} width={12} height={10} fill="#d4af37" opacity={0.9} />
          <rect x={30} y={top + 68} width={8} height={2} fill="#1a1a1a" />
        </g>
      )}
    </g>
  );
}

/* ───────────── 메모리 ───────────── */

function samsungDdr5(): ReactNode {
  const stick = (y: number) => (
    <g>
      <rect x={18} y={y} width={164} height={40} rx={2} fill="#156b3a" />
      <rect x={18} y={y} width={164} height={40} rx={2} fill="#ffffff" opacity={0.05} />
      {range(8).map((i) => (
        <g key={i}>
          <rect x={24 + i * 19.5} y={y + 6} width={14} height={16} rx={1} fill="#121214" />
          <rect x={24 + i * 19.5} y={y + 6} width={14} height={4} fill="#ffffff" opacity={0.12} />
        </g>
      ))}
      {/* 라벨 (글자 대신 줄) */}
      <rect x={96} y={y + 25} width={56} height={10} fill="#e8e9eb" />
      <rect x={100} y={y + 28} width={30} height={1.5} fill="#5c5f66" />
      <rect x={100} y={y + 31} width={42} height={1.5} fill="#5c5f66" />
      {/* 전원 관리 칩 */}
      <rect x={70} y={y + 26} width={10} height={8} fill="#121214" />
      {/* 금 접점과 홈 */}
      {range(40).map((i) => (
        <rect key={`p${i}`} x={22 + i * 3.95} y={y + 40} width={2.6} height={6} fill="#d6a63c" />
      ))}
      <rect x={96} y={y + 40} width={4} height={6} fill="#0b0b0b" />
    </g>
  );
  return (
    <g>
      <Shadow cx={100} cy={170} rx={80} ry={5} />
      {stick(44)}
      {stick(104)}
    </g>
  );
}

function tridentZ5(): ReactNode {
  const stick = (x: number) => (
    <g>
      {/* RGB 빛 막대 (무지개를 칸으로 나눠 표현) */}
      {["#ff3b5c", "#ff8a3d", "#ffd43b", "#3ddc84", "#3db8ff", "#7c5cff", "#ff4fd8"].map((c, i) => (
        <rect key={c} x={x} y={30 + i * 5} width={34} height={5} fill={c} opacity={0.85} />
      ))}
      <rect x={x} y={30} width={34} height={35} fill="#ffffff" opacity={0.18} />
      {/* 알루미늄 방열판: 은색 + 검정 날개 */}
      <rect x={x} y={64} width={34} height={98} fill="#c9ccd1" />
      <path d={`M${x} 64 L${x + 34} 64 L${x + 34} 92 L${x + 10} 112 L${x} 112 Z`} fill="#1a1a1c" />
      <rect x={x} y={64} width={34} height={6} fill="#ffffff" opacity={0.4} />
      <rect x={x + 4} y={130} width={26} height={2} fill="#8a8d93" />
      <rect x={x + 4} y={136} width={18} height={2} fill="#8a8d93" />
      {range(9).map((i) => (
        <rect key={i} x={x + 2 + i * 3.4} y={162} width={2.2} height={8} fill="#d6a63c" />
      ))}
    </g>
  );
  return (
    <g>
      <Shadow cx={100} cy={176} rx={60} ry={5} />
      {stick(56)}
      {stick(110)}
    </g>
  );
}

/* ───────────── 그래픽카드: 팬 쪽에서 본 모습 ───────────── */

type CardStyle = { shroud: string; trim: string; fans: number; length: number; accent: string; backplate: string; fanRing?: string };

function card({ shroud, trim, fans, length, accent, backplate, fanRing }: CardStyle): ReactNode {
  const x = 100 - length / 2;
  const y = 64;
  const h = 76;
  const r = Math.min(30, (length - 16) / fans / 2 - 2);
  return (
    <g>
      <Shadow cx={100} cy={y + h + 16} rx={length / 2} ry={5} />
      {/* 백플레이트 두께 */}
      <rect x={x + 4} y={y - 6} width={length - 4} height={8} rx={3} fill={backplate} />
      <rect x={x + 4} y={y - 6} width={length - 4} height={3} rx={2} fill="#ffffff" opacity={0.15} />
      {/* 전원 커넥터 */}
      <rect x={x + length * 0.62} y={y - 12} width={14} height={7} rx={1} fill="#121214" />
      {/* 슈라우드 */}
      <rect x={x} y={y} width={length} height={h} rx={8} fill={shroud} />
      <rect x={x} y={y} width={length} height={h * 0.3} rx={8} fill="#ffffff" opacity={0.07} />
      <path d={`M${x + 6} ${y + h - 6} L${x + length - 6} ${y + h - 6}`} stroke={trim} strokeWidth={3} />
      <path d={`M${x + 4} ${y + 10} l18 -6 M${x + length - 4} ${y + 10} l-18 -6`} stroke={trim} strokeWidth={2} />
      {range(fans).map((i) => {
        const cx = x + (length / fans) * (i + 0.5);
        return <Fan key={i} cx={cx} cy={y + h / 2} r={r} frame="#121214" blade="#26262b" bladeEdge="#3c3c44" ring={fanRing} />;
      })}
      {/* 브래킷과 PCIe 단자 */}
      <rect x={x - 8} y={y - 4} width={6} height={h + 12} rx={1} fill="#b9bcc2" />
      {range(4).map((i) => (
        <rect key={i} x={x - 7} y={y + 8 + i * 14} width={4} height={8} rx={1} fill="#3d3f44" />
      ))}
      <rect x={x + 18} y={y + h} width={length * 0.45} height={6} fill="#d6a63c" />
      <rect x={x + length - 30} y={y + h - 2} width={22} height={3} fill={accent} />
    </g>
  );
}

/* ───────────── SSD (M.2 2280) ───────────── */

function m2(label: { base: string; band?: string; text: string }): ReactNode {
  return (
    <g>
      <Shadow cx={100} cy={128} rx={86} ry={4} />
      <rect x={14} y={78} width={172} height={42} rx={2} fill="#141416" />
      {/* 금 접점 */}
      {range(14).map((i) => (
        <rect key={i} x={186} y={81 + i * 2.6} width={6} height={1.6} fill="#d6a63c" />
      ))}
      <rect x={6} y={95} width={10} height={8} rx={4} fill="#0b0b0b" stroke="#c9a24a" strokeWidth={1} />
      {/* 라벨 */}
      <rect x={22} y={82} width={158} height={34} rx={1} fill={label.base} />
      {label.band && <rect x={22} y={82} width={158} height={6} fill={label.band} />}
      <rect x={30} y={96} width={60} height={3} fill={label.text} />
      <rect x={30} y={103} width={40} height={2} fill={label.text} opacity={0.7} />
      <rect x={140} y={96} width={30} height={10} rx={1} fill={label.text} opacity={0.15} />
      <rect x={22} y={82} width={158} height={10} fill="#ffffff" opacity={0.06} />
    </g>
  );
}

/* ───────────── 파워: 팬 쪽 3/4 모습 ───────────── */

function psu({ w, body, grille, label }: { w: number; body: string; grille: string; label: string }): ReactNode {
  const x = 100 - w / 2;
  const h = w * 0.62;
  const y = 100 - h / 2 + 4;
  return (
    <g>
      <Shadow cx={100} cy={y + h + 12} rx={w / 2 + 6} ry={5} />
      {/* 윗면(원근) */}
      <path d={`M${x} ${y} L${x + 14} ${y - 12} L${x + w + 14} ${y - 12} L${x + w} ${y} Z`} fill={body} />
      <path d={`M${x} ${y} L${x + 14} ${y - 12} L${x + w + 14} ${y - 12} L${x + w} ${y} Z`} fill="#ffffff" opacity={0.12} />
      <path d={`M${x + w} ${y} L${x + w + 14} ${y - 12} L${x + w + 14} ${y + h - 12} L${x + w} ${y + h} Z`} fill={body} />
      <path d={`M${x + w} ${y} L${x + w + 14} ${y - 12} L${x + w + 14} ${y + h - 12} L${x + w} ${y + h} Z`} fill="#000" opacity={0.3} />
      {/* 앞면(팬) */}
      <rect x={x} y={y} width={w} height={h} rx={3} fill={body} />
      <Fan cx={x + w * 0.5} cy={y + h * 0.5} r={h * 0.4} frame="#121214" blade="#232327" bladeEdge="#34343a" />
      {/* 그릴 */}
      {range(7).map((i) => (
        <circle key={i} cx={x + w * 0.5} cy={y + h * 0.5} r={h * 0.06 + i * h * 0.056} fill="none" stroke={grille} strokeWidth={1.1} opacity={0.75} />
      ))}
      <path
        d={`M${x + w * 0.5 - h * 0.42} ${y + h * 0.5} h${h * 0.84} M${x + w * 0.5} ${y + h * 0.08} v${h * 0.84}`}
        stroke={grille}
        strokeWidth={1.1}
        opacity={0.6}
      />
      {/* 옆면 라벨 띠 */}
      <path
        d={`M${x + w + 2} ${y + 10} L${x + w + 12} ${y} L${x + w + 12} ${y + h * 0.45} L${x + w + 2} ${y + h * 0.55} Z`}
        fill={label}
        opacity={0.85}
      />
    </g>
  );
}

/* ───────────── 케이스 ───────────── */

/** 프랙탈 North: 짙은 상자, 앞면 오른쪽에 원목 세로 살, 강화유리 옆판 */
function north(): ReactNode {
  return (
    <g>
      <Shadow cx={100} cy={184} rx={70} ry={6} />
      {/* 옆판(유리) */}
      <path d="M40 30 L118 24 L118 178 L40 172 Z" fill="#1c1d21" />
      <path d="M44 34 L114 29 L114 172 L44 168 Z" fill="#2c3036" opacity={0.85} />
      <path d="M48 40 L80 37 L60 166 L48 165 Z" fill="#ffffff" opacity={0.08} />
      {/* 유리 안 부품 */}
      <rect x={62} y={52} width={40} height={64} fill="#1a2a20" opacity={0.8} />
      <rect x={60} y={118} width={46} height={12} fill="#2b2b30" />
      <circle cx={84} cy={74} r={10} fill="#2a2a2e" />
      {/* 앞면 */}
      <path d="M118 24 L160 30 L160 176 L118 178 Z" fill="#2a2b2f" />
      {/* 원목 살 */}
      {range(7).map((i) => (
        <path
          key={i}
          d={`M${123 + i * 5.2} ${28 + i * 0.6} L${126.5 + i * 5.2} ${28.5 + i * 0.6} L${126.5 + i * 5.2} ${175.5 - i * 0.2} L${123 + i * 5.2} ${176 - i * 0.2} Z`}
          fill={i % 2 ? "#8a5a2b" : "#9b6834"}
        />
      ))}
      <path d="M118 24 L160 30 L160 60 L118 56 Z" fill="#ffffff" opacity={0.08} />
      {/* 윗면 */}
      <path d="M40 30 L118 24 L160 30 L82 36 Z" fill="#35363b" />
      {/* 놋쇠 버튼 */}
      <circle cx={140} cy={30} r={2.2} fill="#c9a35b" />
      {/* 발 */}
      <rect x={46} y={172} width={10} height={6} fill="#111" />
      <rect x={148} y={176} width={10} height={5} fill="#111" />
    </g>
  );
}

/** 쿨러마스터 NR200P: 작은 ITX 상자, 타공 윗면과 옆면 */
function nr200p(): ReactNode {
  return (
    <g>
      <Shadow cx={100} cy={170} rx={70} ry={6} />
      {/* 윗면 */}
      <path d="M36 60 L120 44 L168 62 L84 78 Z" fill="#2a2b30" />
      <Perforation x={70} y={54} w={60} h={16} gap={3.6} r={0.9} opacity={0.7} />
      {/* 옆면(타공) */}
      <path d="M36 60 L84 78 L84 160 L36 142 Z" fill="#1d1e22" />
      <Perforation x={44} y={84} w={34} h={54} gap={3.6} r={0.9} opacity={0.75} />
      {/* 앞면 */}
      <path d="M84 78 L168 62 L168 144 L84 160 Z" fill="#232428" />
      <path d="M84 78 L168 62 L168 80 L84 96 Z" fill="#ffffff" opacity={0.07} />
      {/* 앞 아래 단자와 버튼 */}
      <circle cx={156} cy={140} r={2.5} fill="#3db8ff" />
      <rect x={140} y={140} width={8} height={3} rx={1} fill="#111" />
      {/* 손잡이처럼 보이는 위 테두리 */}
      <path d="M36 60 L120 44 L168 62" fill="none" stroke="#3b3c42" strokeWidth={2} />
    </g>
  );
}

/* ───────────── CPU 쿨러 ───────────── */

function dualTower({ fanFrame, fanBlade, fanEdge }: { fanFrame: string; fanBlade: string; fanEdge: string }): ReactNode {
  const fins = (x: number) => (
    <g>
      <rect x={x} y={34} width={44} height={110} fill="#b8bcc2" />
      {range(26).map((i) => (
        <rect key={i} x={x} y={36 + i * 4.1} width={44} height={1.4} fill="#7f838a" />
      ))}
      <rect x={x} y={34} width={44} height={6} fill="#e6e8eb" />
      <rect x={x} y={34} width={10} height={110} fill="#ffffff" opacity={0.18} />
    </g>
  );
  return (
    <g>
      <Shadow cx={100} cy={176} rx={70} ry={6} />
      {/* 히트파이프 */}
      {range(4).map((i) => (
        <path
          key={i}
          d={`M${62 + i * 6} 150 C ${62 + i * 6} 168, ${132 + i * 6} 168, ${132 + i * 6} 150`}
          fill="none"
          stroke="#c98a4b"
          strokeWidth={3}
        />
      ))}
      {fins(36)}
      {fins(120)}
      {/* 가운데 팬 */}
      <rect x={78} y={44} width={44} height={96} rx={4} fill={fanFrame} />
      <Fan cx={100} cy={92} r={20} frame={fanFrame} blade={fanBlade} bladeEdge={fanEdge} hub={fanFrame} blades={7} />
      {/* 베이스 */}
      <rect x={82} y={150} width={36} height={12} rx={2} fill="#c3c6cc" />
      <rect x={82} y={150} width={36} height={4} fill="#ffffff" opacity={0.4} />
    </g>
  );
}

export const pcModels: Record<string, () => ReactNode> = {
  "amd-ryzen-7-9800x3d": () => am5("9800X3D"),
  "amd-ryzen-5-9600x": () => am5("9600X"),
  "intel-core-ultra-7-265k": lga1851,
  "asus-tuf-gaming-b650-plus": () => board({ pcb: "#16171a", heatsink: "#4a4c52", heatsinkLight: "#c9ccd1", accent: "#d9a441" }),
  "msi-mag-b650m-mortar-wifi": () =>
    board({ pcb: "#121315", heatsink: "#8c9097", heatsinkLight: "#ffffff", accent: "#5a5e66", matx: true, wifi: true }),
  "asrock-z890-pro-rs": () => board({ pcb: "#141416", heatsink: "#b9bcc2", heatsinkLight: "#ffffff", accent: "#3a3b40" }),
  "samsung-ddr5-5600-32gb-kit": samsungDdr5,
  "gskill-trident-z5-rgb-ddr5-6000-64gb": tridentZ5,
  "geforce-rtx-5070-ti-16gb": () =>
    card({ shroud: "#1e1f23", trim: "#9aa0a8", fans: 3, length: 184, accent: "#76b900", backplate: "#2b2c31", fanRing: "#3a3b41" }),
  "radeon-rx-9070-xt-16gb": () => card({ shroud: "#18181b", trim: "#c72c2c", fans: 3, length: 190, accent: "#c72c2c", backplate: "#26262a" }),
  "geforce-rtx-5060-8gb": () => card({ shroud: "#2a2b30", trim: "#6c7078", fans: 2, length: 126, accent: "#76b900", backplate: "#202125" }),
  "samsung-990-pro-2tb": () => m2({ base: "#101012", band: "#1c1c20", text: "#e7e7e7" }),
  "wd-black-sn850x-1tb": () => m2({ base: "#0c0c0d", text: "#f2f2f2", band: "#2a2a2e" }),
  "seasonic-focus-gx-850": () => psu({ w: 128, body: "#1b1c1f", grille: "#5a5d64", label: "#c9a24a" }),
  "corsair-sf750": () => psu({ w: 100, body: "#202125", grille: "#6a6d74", label: "#9fa3aa" }),
  "micronics-classic-ii-600": () => psu({ w: 128, body: "#26272b", grille: "#4f5258", label: "#7c8088" }),
  "antec-torque": antecTorque,
  "fractal-north": north,
  "cooler-master-nr200p": nr200p,
  "thermalright-peerless-assassin-120-se": () => dualTower({ fanFrame: "#141416", fanBlade: "#2a2a2f", fanEdge: "#3e3e45" }),
  "noctua-nh-d15-g2": () => dualTower({ fanFrame: "#d8c3a5", fanBlade: "#6b3f2b", fanEdge: "#8a5640" }),
};
