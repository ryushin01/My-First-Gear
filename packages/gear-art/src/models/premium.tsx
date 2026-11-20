import type { ReactNode } from "react";
import { monitor } from "./devices";
import { Fan, Metal, Perforation, Shadow, range } from "./parts";
import { m2 } from "./pc";

/*
 * 1.1.0에서 더한 고가 상품 44개의 실사풍 그림.
 * 실제 제품의 형태·색·재질을 따르고, 로고·상표 문양과 글자는 넣지 않는다(글자 자리는 줄로).
 */

/* ───────────── CPU ───────────── */

/** LGA1700(12세대): 세로로 긴 초록 기판, 모서리를 계단처럼 깎은 히트스프레더, 양옆 노치 */
function alderLake(): ReactNode {
  return (
    <g>
      <Shadow cx={100} cy={178} rx={54} ry={6} />
      <rect x={50} y={26} width={100} height={148} rx={5} fill="#1d5e40" />
      <rect x={50} y={26} width={100} height={148} rx={5} fill="none" stroke="#2f8458" strokeWidth={1.5} />
      {range(12).map((i) => (
        <g key={i}>
          <rect x={56 + i * 7.6} y={30} width={3.6} height={4} fill="#b88a34" />
          <rect x={56 + i * 7.6} y={166} width={3.6} height={4} fill="#b88a34" />
        </g>
      ))}
      <rect x={46} y={58} width={6} height={12} fill="#0d0d0e" />
      <rect x={148} y={58} width={6} height={12} fill="#0d0d0e" />
      <path d="M62 42 H138 V58 H146 V142 H138 V158 H62 V142 H54 V58 H62 Z" fill="#c7cbd1" />
      <path d="M62 42 H138 V58 H146 V84 H54 V58 H62 Z" fill="#ffffff" opacity={0.3} />
      <path d="M54 124 H146 V142 H138 V158 H62 V142 H54 Z" fill="#000" opacity={0.1} />
      <rect x={70} y={92} width={60} height={3} fill="#85888e" />
      <rect x={70} y={100} width={44} height={3} fill="#85888e" />
      <rect x={70} y={110} width={52} height={2} fill="#9b9ea4" />
      <rect x={70} y={116} width={30} height={2} fill="#9b9ea4" />
      <path d="M53 171 L53 160 L64 171 Z" fill="#e8b84a" />
    </g>
  );
}

/** sTR5 스레드리퍼: 주황 캐리어 프레임에 끼운 큰 기판, 넓은 니켈 히트스프레더 */
function threadripper(pro: boolean): ReactNode {
  return (
    <g>
      <Shadow cx={100} cy={172} rx={84} ry={6} />
      <rect x={14} y={36} width={172} height={128} rx={8} fill="#f26b1d" />
      <rect x={14} y={36} width={172} height={36} rx={8} fill="#ffffff" opacity={0.16} />
      <rect x={14} y={138} width={172} height={26} rx={8} fill="#000" opacity={0.14} />
      {/* 프레임 손잡이 홈과 고정 구멍 */}
      <rect x={18} y={90} width={8} height={20} rx={2} fill="#b84a10" />
      <rect x={174} y={90} width={8} height={20} rx={2} fill="#b84a10" />
      {[22, 178].map((cx) => [44, 156].map((cy) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={3} fill="#b84a10" />))}
      {/* 기판과 커패시터 */}
      <rect x={30} y={44} width={140} height={112} rx={4} fill="#17543a" />
      {range(14).map((i) => (
        <g key={i}>
          <rect x={36 + i * 9.4} y={47} width={4} height={3} fill="#c69a3a" />
          <rect x={36 + i * 9.4} y={150} width={4} height={3} fill="#c69a3a" />
        </g>
      ))}
      {/* 히트스프레더 */}
      <rect x={38} y={54} width={124} height={92} rx={4} fill="#c9ccd1" />
      <rect x={38} y={54} width={124} height={30} rx={4} fill="#ffffff" opacity={0.32} />
      <rect x={38} y={122} width={124} height={24} rx={4} fill="#000" opacity={0.1} />
      <rect x={52} y={92} width={70} height={4} fill="#85888e" />
      <rect x={52} y={101} width={pro ? 92 : 56} height={3} fill="#85888e" />
      {pro && <rect x={52} y={109} width={24} height={3} fill="#85888e" />}
      <rect x={52} y={118} width={40} height={2} fill="#9b9ea4" />
      <path d="M34 152 L34 141 L45 152 Z" fill="#e8b84a" />
    </g>
  );
}

/* ───────────── 메인보드: 위에서 본 큰 보드 ───────────── */

type BigBoard = {
  socket: "lga1700" | "lga1851" | "am5" | "str5";
  pcb: string;
  heatsink: string;
  heatsinkLight: string;
  accent: string;
  /** 커넥터를 뒷면으로 옮긴 보드(MSI Project Zero): 가장자리 전원 단자가 없다 */
  backConnect?: boolean;
  /** I/O 덮개의 LED 점 행렬 표시(ROG AniMe Matrix) */
  matrix?: boolean;
  /** 메모리 슬롯: 소켓 오른쪽 4개, 또는 소켓 양옆 2개씩(워크스테이션) */
  dimms?: "right" | "split";
  /** PCIe x16 슬롯 수 */
  slots?: number;
  /** 방열판의 위장 무늬(MAG 토마호크) */
  camo?: boolean;
  /** 오른쪽 가장자리의 전원 버튼·Q-Code 표시 */
  controls?: boolean;
};

function bigBoard({
  socket,
  pcb,
  heatsink,
  heatsinkLight,
  accent,
  backConnect,
  matrix,
  dimms = "right",
  slots = 3,
  camo,
  controls,
}: BigBoard): ReactNode {
  const split = dimms === "split";
  const sock = {
    am5: { x: 70, y: 38, w: 44, h: 44 },
    lga1700: { x: 72, y: 34, w: 40, h: 50 },
    lga1851: { x: 72, y: 34, w: 40, h: 50 },
    str5: { x: 72, y: 30, w: 56, h: 58 },
  }[socket];
  const dimmX = split ? [58, 65, 135, 142] : [124, 132, 140, 148];
  const ioW = split ? 28 : 34;
  const slotGap = slots > 3 ? 15 : 20;
  return (
    <g>
      <Shadow cx={100} cy={194} rx={78} ry={4} />
      <rect x={22} y={12} width={156} height={176} rx={3} fill={pcb} />
      {range(10).map((i) => (
        <path key={i} d={`M26 ${30 + i * 15} h${36 + (i % 4) * 18}`} stroke="#ffffff" strokeOpacity={0.05} strokeWidth={1} />
      ))}
      {/* I/O 덮개 + 전원부 방열판 */}
      <Metal x={24} y={14} w={ioW} h={72} r={3} base={heatsink} light={heatsinkLight} />
      <Metal x={split ? 74 : 60} y={14} w={split ? 52 : 58} h={14} r={3} base={heatsink} light={heatsinkLight} />
      {camo &&
        [0, 1, 2].map((i) => (
          <path
            key={i}
            d={`M${26 + i * 10} ${20 + i * 18} l${ioW - 6 - i * 8} -4 l-4 ${10 + i * 3} l${-(ioW - 10 - i * 8)} 4 Z`}
            fill="#ffffff"
            opacity={0.1}
          />
        ))}
      {matrix &&
        range(5).map((i) =>
          range(13).map((j) => {
            const lit = (i * 3 + j * 2) % 7 === 0 || (j > 4 && j < 8 && i % 2 === 1);
            return (
              <circle key={`${i}-${j}`} cx={28.5 + i * 6} cy={21 + j * 4.8} r={1.2} fill={lit ? "#f5f5f2" : "#000"} opacity={lit ? 0.9 : 0.45} />
            );
          }),
        )}
      <rect x={24} y={44} width={ioW} height={2.5} fill={accent} />
      {/* 소켓 */}
      <rect x={sock.x} y={sock.y} width={sock.w} height={sock.h} rx={2} fill="#2a2b2f" />
      <rect x={sock.x + 4} y={sock.y + 4} width={sock.w - 8} height={sock.h - 8} rx={1} fill="#b8bcc2" />
      <rect x={sock.x + 4} y={sock.y + 4} width={sock.w - 8} height={(sock.h - 8) * 0.3} fill="#ffffff" opacity={0.3} />
      {socket === "str5" ? (
        range(3).map((i) => <circle key={i} cx={sock.x + 12 + i * 16} cy={sock.y + sock.h - 10} r={3} fill="#6d7178" />)
      ) : (
        <rect x={sock.x + sock.w - 2} y={sock.y + 6} width={4} height={sock.h - 12} fill="#9a9ea5" />
      )}
      {/* 메모리 슬롯 */}
      {dimmX.map((dx, i) => (
        <g key={dx}>
          <rect x={dx} y={split ? 26 : 22} width={6} height={70} rx={1} fill={i % 2 ? "#3a3b40" : "#5a5c63"} />
          <rect x={dx} y={split ? 26 : 22} width={6} height={4} fill="#c8cbd0" />
          <rect x={dx} y={split ? 92 : 88} width={6} height={4} fill="#c8cbd0" />
        </g>
      ))}
      {/* 24핀 전원(뒷면 커넥터 보드는 없음) */}
      {!backConnect && <rect x={162} y={100} width={10} height={30} rx={1} fill="#1b1b1d" />}
      {backConnect && <rect x={170} y={14} width={6} height={172} rx={2} fill="#000" opacity={0.25} />}
      {/* M.2 방열판 */}
      <Metal x={40} y={98} w={84} h={10} r={2} base={heatsink} light={heatsinkLight} />
      <rect x={40} y={102} width={84} height={2} fill={accent} opacity={0.9} />
      {/* PCIe x16 슬롯 */}
      {range(slots).map((i) => {
        const y = 114 + i * slotGap;
        const armored = i === 0 || slots > 3;
        return (
          <g key={i}>
            <rect x={30} y={y} width={104} height={7} rx={1} fill={armored ? "#c3c6cc" : "#3a3b40"} />
            <rect x={32} y={y + 2} width={100} height={3} fill="#2c2d31" />
          </g>
        );
      })}
      {/* 칩셋·M.2 덮개 */}
      <Metal x={136} y={136} w={38} h={48} r={4} base={heatsink} light={heatsinkLight} />
      <path d="M140 150 h30" stroke={accent} strokeWidth={2} />
      {camo && <path d="M140 160 l20 -6 l8 10 l-22 6 Z" fill="#ffffff" opacity={0.1} />}
      {/* 커패시터·초크 */}
      {range(6).map((i) => (
        <rect key={i} x={sock.x - 6 + i * 9} y={sock.y + sock.h + 4} width={6} height={4} rx={1} fill="#2e2f33" />
      ))}
      {controls && (
        <g>
          <rect x={160} y={140} width={12} height={10} rx={1} fill="#0b0b0c" />
          <rect x={162} y={142} width={3} height={6} fill="#ff3131" />
          <rect x={166} y={142} width={3} height={6} fill="#ff3131" />
          <circle cx={166} cy={160} r={3.5} fill="#ff3131" />
          <circle cx={166} cy={170} r={3} fill="#c3c6cc" />
        </g>
      )}
    </g>
  );
}

/* ───────────── 메모리 ───────────── */

/** 방열판 없는 초록 기판 한 개: 칩 8개, 가운데 전원 관리 칩, 라벨 */
function samsungStick(): ReactNode {
  const y = 66;
  return (
    <g>
      <Shadow cx={100} cy={132} rx={86} ry={5} />
      <rect x={14} y={y} width={172} height={52} rx={2} fill="#156b3a" />
      <rect x={14} y={y} width={172} height={14} rx={2} fill="#ffffff" opacity={0.06} />
      {[20, 38, 56, 74, 112, 130, 148, 166].map((x) => (
        <g key={x}>
          <rect x={x} y={y + 6} width={14} height={20} rx={1} fill="#121214" />
          <rect x={x} y={y + 6} width={14} height={5} fill="#ffffff" opacity={0.12} />
        </g>
      ))}
      <rect x={93} y={y + 8} width={14} height={12} fill="#121214" />
      <rect x={20} y={y + 30} width={64} height={14} fill="#e8e9eb" />
      <rect x={24} y={y + 34} width={34} height={1.6} fill="#5c5f66" />
      <rect x={24} y={y + 38} width={50} height={1.6} fill="#5c5f66" />
      {range(8).map((i) => (
        <rect key={i} x={112 + i * 8} y={y + 34} width={4} height={3} rx={0.6} fill="#c8a24a" />
      ))}
      {range(44).map((i) => (
        <rect key={`p${i}`} x={18 + i * 3.8} y={y + 52} width={2.5} height={7} fill="#d6a63c" />
      ))}
      <rect x={96} y={y + 52} width={4} height={7} fill="#0b0b0b" />
    </g>
  );
}

/** 트라이던트 Z5 RGB(검정): 무지개 빛 막대, 검정 알루미늄 방열판에 은빛 사선 */
function tridentZ5Black(): ReactNode {
  const stick = (x: number) => (
    <g>
      {["#ff3b5c", "#ff8a3d", "#ffd43b", "#3ddc84", "#3db8ff", "#7c5cff", "#ff4fd8"].map((c, i) => (
        <rect key={c} x={x} y={30 + i * 5} width={34} height={5} fill={c} opacity={0.85} />
      ))}
      <rect x={x} y={30} width={34} height={35} fill="#ffffff" opacity={0.15} />
      <rect x={x} y={64} width={34} height={98} fill="#232428" />
      <path d={`M${x} 64 L${x + 34} 64 L${x + 34} 92 L${x + 10} 112 L${x} 112 Z`} fill="#0f0f11" />
      <path d={`M${x + 34} 92 L${x + 10} 112 L${x + 13} 115 L${x + 34} 97 Z`} fill="#9a9ea5" />
      <rect x={x} y={64} width={34} height={5} fill="#ffffff" opacity={0.18} />
      <rect x={x + 4} y={130} width={26} height={2} fill="#55585f" />
      <rect x={x + 4} y={136} width={18} height={2} fill="#55585f" />
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

/** 도미네이터 티타늄: 윗면의 LED 칸 막대, 모서리를 깎은 짙은 티타늄 방열판 */
function dominatorTitanium(): ReactNode {
  const stick = (x: number) => (
    <g>
      <rect x={x} y={24} width={36} height={16} rx={2} fill="#101012" />
      {["#ffcf3d", "#ff8a3d", "#ff3b5c", "#c03dff", "#3db8ff", "#3ddc84"].map((c, i) => (
        <rect key={c} x={x + 2.4 + i * 5.4} y={28} width={4.2} height={8} rx={1} fill={c} opacity={0.9} />
      ))}
      <path d={`M${x} 40 H${x + 36} V162 H${x} Z`} fill="#3b3d42" />
      <path d={`M${x} 40 H${x + 36} L${x + 30} 54 H${x + 6} Z`} fill="#8b8f96" />
      <rect x={x + 6} y={54} width={24} height={102} fill="#2a2c30" />
      {range(17).map((i) => (
        <rect key={i} x={x + 6} y={57 + i * 5.8} width={24} height={1} fill="#ffffff" opacity={0.08} />
      ))}
      <path d={`M${x} 162 H${x + 36} L${x + 30} 156 H${x + 6} Z`} fill="#1d1e22" />
      <rect x={x} y={40} width={4} height={122} fill="#ffffff" opacity={0.14} />
      {range(9).map((i) => (
        <rect key={`p${i}`} x={x + 2 + i * 3.6} y={162} width={2.4} height={8} fill="#d6a63c" />
      ))}
    </g>
  );
  return (
    <g>
      <Shadow cx={100} cy={176} rx={62} ry={5} />
      {stick(54)}
      {stick(108)}
    </g>
  );
}

/** Zeta R5 Neo RDIMM 4개: 무광 회색 방열판에 밝은 사선 면과 검은 띠, RGB 없음 */
function zetaR5(): ReactNode {
  const stick = (x: number) => (
    <g>
      <rect x={x} y={42} width={28} height={114} rx={1} fill="#8f949c" />
      <path d={`M${x} 42 H${x + 28} V68 L${x} 94 Z`} fill="#c4c8ce" />
      <path d={`M${x} 118 L${x + 28} 92 V102 L${x} 128 Z`} fill="#1c1d21" />
      <rect x={x} y={42} width={28} height={5} fill="#ffffff" opacity={0.35} />
      <rect x={x + 4} y={138} width={20} height={2} fill="#5f636a" />
      <rect x={x + 4} y={143} width={12} height={2} fill="#5f636a" />
      {range(7).map((i) => (
        <rect key={i} x={x + 2 + i * 3.6} y={156} width={2.2} height={8} fill="#d6a63c" />
      ))}
    </g>
  );
  return (
    <g>
      <Shadow cx={100} cy={170} rx={80} ry={5} />
      {[32, 68, 104, 140].map((x) => (
        <g key={x}>{stick(x)}</g>
      ))}
    </g>
  );
}

/* ───────────── 그래픽카드: 팬 쪽에서 본 모습 ───────────── */

type Gpu = {
  length: number;
  shroud: string;
  fans: number;
  fanFrame: string;
  fanBlade: string;
  fanEdge: string;
  fanRing?: string;
  backplate: string;
  /** 슈라우드 위에 겹치는 장식 */
  trim?: ReactNode;
};

function gpu({ length, shroud, fans, fanFrame, fanBlade, fanEdge, fanRing, backplate, trim }: Gpu): ReactNode {
  const x = 100 - length / 2;
  const y = 62;
  const h = 80;
  const r = Math.min(29, (length - 16) / fans / 2 - 2);
  return (
    <g>
      <Shadow cx={100} cy={y + h + 16} rx={length / 2} ry={5} />
      <rect x={x + 4} y={y - 8} width={length - 4} height={10} rx={3} fill={backplate} />
      <rect x={x + 4} y={y - 8} width={length - 4} height={3} rx={2} fill="#ffffff" opacity={0.15} />
      <rect x={x + length * 0.6} y={y - 14} width={16} height={7} rx={1} fill="#121214" />
      <rect x={x} y={y} width={length} height={h} rx={8} fill={shroud} />
      <rect x={x} y={y} width={length} height={h * 0.3} rx={8} fill="#ffffff" opacity={0.08} />
      {trim}
      {range(fans).map((i) => (
        <Fan
          key={i}
          cx={x + (length / fans) * (i + 0.5)}
          cy={y + h / 2}
          r={r}
          frame={fanFrame}
          blade={fanBlade}
          bladeEdge={fanEdge}
          hub={fanFrame}
          ring={fanRing}
        />
      ))}
      <rect x={x - 8} y={y - 4} width={6} height={h + 12} rx={1} fill="#b9bcc2" />
      {range(4).map((i) => (
        <rect key={i} x={x - 7} y={y + 8 + i * 15} width={4} height={8} rx={1} fill="#3d3f44" />
      ))}
      <rect x={x + 18} y={y + h} width={length * 0.42} height={6} fill="#d6a63c" />
    </g>
  );
}

/** ROG STRIX RTX 3090: 짙은 회색 슈라우드, 각진 은색 테, 아래 RGB 띠 */
function strix3090(): ReactNode {
  return gpu({
    length: 192,
    shroud: "#202226",
    fans: 3,
    fanFrame: "#16171a",
    fanBlade: "#2b2c31",
    fanEdge: "#4a4c53",
    backplate: "#2c2e33",
    trim: (
      <g>
        <path d="M8 70 L40 64 M192 70 L160 64" stroke="#8e939b" strokeWidth={3} />
        <path d="M14 136 L72 136 L80 130 L120 130 L128 136 L186 136" fill="none" stroke="#8e939b" strokeWidth={2.5} />
        {["#ff3b5c", "#c03dff", "#3db8ff", "#3ddc84"].map((c, i) => (
          <rect key={c} x={140 + i * 10} y={138} width={10} height={2.5} fill={c} />
        ))}
      </g>
    ),
  });
}

/** RTX 4090 AERO: 은백색 슈라우드와 흰 팬, 옅은 회색 줄 */
function aero4090(): ReactNode {
  return gpu({
    length: 190,
    shroud: "#d5d8dd",
    fans: 3,
    fanFrame: "#eceef1",
    fanBlade: "#c3c7cd",
    fanEdge: "#9da2a9",
    fanRing: "#b9bdc4",
    backplate: "#c9ccd1",
    trim: (
      <g>
        <path d="M12 136 H188" stroke="#9aa0a8" strokeWidth={2} />
        <path d="M12 68 L36 64 M188 68 L164 64" stroke="#9aa0a8" strokeWidth={2} />
        <rect x={150} y={133} width={30} height={2} fill="#7fd3ff" opacity={0.8} />
      </g>
    ),
  });
}

/** ROG Astral RTX 5090: 아주 긴 검정 슈라우드의 각진 면, 은색 사선, 위 RGB 막대 */
function astral5090(): ReactNode {
  return gpu({
    length: 196,
    shroud: "#17181b",
    fans: 3,
    fanFrame: "#121214",
    fanBlade: "#28292e",
    fanEdge: "#45474e",
    fanRing: "#3a3c42",
    backplate: "#26272b",
    trim: (
      <g>
        <path d="M2 62 L60 62 L40 142 L2 142 Z" fill="#ffffff" opacity={0.05} />
        <path d="M140 62 L198 62 L198 142 L160 142 Z" fill="#ffffff" opacity={0.04} />
        <path d="M52 142 L74 62" stroke="#9aa0a8" strokeWidth={2} />
        <path d="M126 142 L148 62" stroke="#9aa0a8" strokeWidth={2} />
        {["#ff3b5c", "#ff4fd8", "#7c5cff", "#3db8ff", "#3ddc84", "#ffd43b"].map((c, i) => (
          <rect key={c} x={20 + i * 26} y={62} width={26} height={2.5} fill={c} opacity={0.9} />
        ))}
      </g>
    ),
  });
}

/** RTX PRO 6000 서버 에디션: 팬 없는 패시브 냉각, 검은 덮개와 끝의 방열핀 창 */
function rtxProServer(): ReactNode {
  const x = 14;
  const y = 60;
  const w = 174;
  const h = 82;
  return (
    <g>
      <Shadow cx={100} cy={y + h + 16} rx={88} ry={5} />
      <rect x={x + 4} y={y - 8} width={w - 4} height={10} rx={3} fill="#232428" />
      <rect x={x} y={y} width={w} height={h} rx={6} fill="#1a1b1e" />
      <rect x={x} y={y} width={w} height={h * 0.3} rx={6} fill="#ffffff" opacity={0.07} />
      {/* 덮개 안 방열핀이 보이는 창(양 끝) */}
      {[x + 8, x + w - 46].map((wx) => (
        <g key={wx}>
          <rect x={wx} y={y + 10} width={38} height={h - 20} rx={3} fill="#0c0c0d" />
          {range(14).map((i) => (
            <rect key={i} x={wx + 2 + i * 2.6} y={y + 12} width={1.2} height={h - 24} fill="#9da1a8" opacity={0.7} />
          ))}
        </g>
      ))}
      <path d={`M${x + 52} ${y + 18} H${x + w - 52}`} stroke="#8d9198" strokeWidth={2} />
      <path d={`M${x + 52} ${y + h - 18} H${x + w - 52}`} stroke="#8d9198" strokeWidth={2} />
      <rect x={x + 60} y={y + h / 2 - 1.5} width={54} height={3} fill="#76b900" />
      {/* 뒤 끝의 전원 단자 */}
      <rect x={x + w - 6} y={y + 26} width={8} height={18} rx={1} fill="#121214" />
      <rect x={x - 8} y={y - 4} width={6} height={h + 12} rx={1} fill="#b9bcc2" />
      <Perforation x={x - 8} y={y + 4} w={6} h={h - 4} gap={3} r={0.7} opacity={0.6} />
      <rect x={x + 18} y={y + h} width={w * 0.42} height={6} fill="#d6a63c" />
    </g>
  );
}

/** AORUS RTX 5090 워터블록: 팬 없이 전면 수랭 블록, 아크릴 창의 니켈 핀, 포트 둘, 작은 LCD */
function waterforceWb(): ReactNode {
  const x = 14;
  const y = 58;
  const w = 172;
  const h = 86;
  return (
    <g>
      <Shadow cx={100} cy={y + h + 16} rx={88} ry={5} />
      <rect x={x + 4} y={y - 8} width={w - 4} height={10} rx={3} fill="#232428" />
      <rect x={x} y={y} width={w} height={h} rx={6} fill="#1b1c20" />
      <rect x={x} y={y} width={w} height={h * 0.25} rx={6} fill="#ffffff" opacity={0.06} />
      <rect x={x + 14} y={y + 14} width={w - 72} height={h - 28} rx={10} fill="#2b3036" />
      {range(16).map((i) => (
        <rect key={i} x={x + 21 + i * 5.9} y={y + 22} width={2.2} height={h - 44} fill="#c0c4ca" opacity={0.75} />
      ))}
      <rect x={x + 14} y={y + 14} width={w - 72} height={10} rx={6} fill="#ffffff" opacity={0.1} />
      <rect x={x + 14} y={y + 14} width={w - 72} height={h - 28} rx={10} fill="none" stroke="#ff6a00" strokeWidth={2} />
      {[y + 22, y + h - 22].map((cy) => (
        <g key={cy}>
          <circle cx={x + w - 28} cy={cy} r={11} fill="#3a3c41" />
          <circle cx={x + w - 28} cy={cy} r={7} fill="#9fa3aa" />
          <circle cx={x + w - 28} cy={cy} r={3.5} fill="#1a1a1c" />
        </g>
      ))}
      <rect x={x + w - 50} y={y + h / 2 - 7} width={40} height={14} rx={2} fill="#0b0e14" />
      <rect x={x + w - 46} y={y + h / 2 - 3} width={22} height={2} fill="#ff6a00" />
      <rect x={x + w - 46} y={y + h / 2 + 1} width={14} height={2} fill="#9fd3ff" />
      <rect x={x - 8} y={y - 4} width={6} height={h + 12} rx={1} fill="#b9bcc2" />
      {range(4).map((i) => (
        <rect key={i} x={x - 7} y={y + 8 + i * 15} width={4} height={8} rx={1} fill="#3d3f44" />
      ))}
      <rect x={x + 18} y={y + h} width={w * 0.42} height={6} fill="#d6a63c" />
    </g>
  );
}

/* ───────────── 라이저·파워·SSD ───────────── */

/** ROG Strix 라이저 케이블: S자로 접힌 검은 리본, 한쪽은 금 접점 기판, 다른 쪽은 PCIe 슬롯 */
function riserCable(): ReactNode {
  const ribbon = "M40 148 C 40 104, 160 116, 160 72";
  return (
    <g>
      <Shadow cx={100} cy={180} rx={80} ry={5} />
      <path d={ribbon} fill="none" stroke="#0e0e10" strokeWidth={30} />
      <path d={ribbon} fill="none" stroke="#25262b" strokeWidth={26} />
      {[-9, -4.5, 0, 4.5, 9].map((dx) => (
        <path key={dx} d={ribbon} fill="none" stroke="#3a3c42" strokeWidth={1} transform={`translate(${dx} 0)`} />
      ))}
      <path d={ribbon} fill="none" stroke="#ffffff" strokeOpacity={0.06} strokeWidth={8} transform="translate(-6 -2)" />
      <rect x={20} y={144} width={40} height={24} rx={2} fill="#1a1a1c" />
      <rect x={20} y={148} width={40} height={3} fill="#ff3131" />
      {range(13).map((i) => (
        <rect key={i} x={22 + i * 2.8} y={168} width={1.8} height={7} fill="#d6a63c" />
      ))}
      <rect x={140} y={42} width={40} height={30} rx={2} fill="#1a1a1c" />
      <rect x={144} y={48} width={32} height={7} rx={1} fill="#3a3b40" />
      <rect x={146} y={50.5} width={28} height={2} fill="#0b0b0c" />
      <rect x={140} y={64} width={40} height={3} fill="#ff3131" />
    </g>
  );
}

/** ROG THOR 1200W: 옆판의 OLED 전력 표시와 RGB 띠, 앞면 135mm 팬 */
function rogThor(): ReactNode {
  return (
    <g>
      <Shadow cx={100} cy={150} rx={84} ry={6} />
      {/* 윗면 */}
      <path d="M22 76 L96 76 L178 58 L104 58 Z" fill="#26272b" />
      <path d="M22 76 L96 76 L178 58 L104 58 Z" fill="#ffffff" opacity={0.1} />
      {/* 앞면(팬) */}
      <rect x={22} y={76} width={74} height={66} rx={2} fill="#1b1c1f" />
      <Fan cx={59} cy={109} r={27} frame="#121214" blade="#232327" bladeEdge="#34343a" />
      {range(5).map((i) => (
        <circle key={i} cx={59} cy={109} r={6 + i * 5} fill="none" stroke="#55585f" strokeWidth={1} opacity={0.7} />
      ))}
      {/* 긴 옆판 */}
      <path d="M96 76 L178 58 L178 124 L96 142 Z" fill="#202125" />
      <path d="M96 76 L178 58 L178 72 L96 90 Z" fill="#ffffff" opacity={0.06} />
      {/* 방열 무늬 */}
      {range(5).map((i) => (
        <path key={i} d={`M${102 + i * 6} ${88 - i * 1.3} L${102 + i * 6} ${132 - i * 1.3}`} stroke="#000" strokeOpacity={0.35} strokeWidth={2} />
      ))}
      {/* OLED 전력 표시 */}
      <path d="M134 82 L170 74 L170 92 L134 100 Z" fill="#05070b" />
      {range(4).map((i) => (
        <path key={i} d={`M${138 + i * 7} ${89 - i * 1.6} l4 -0.9 l0 6 l-4 0.9 Z`} fill="#e8f4ff" opacity={0.9} />
      ))}
      <path d="M138 96 l28 -6.2" stroke="#3db8ff" strokeWidth={1.4} />
      {/* RGB 사선 띠 */}
      {["#ff3b5c", "#ff4fd8", "#7c5cff", "#3db8ff"].map((c, i) => (
        <path key={c} d={`M${100 + i * 19} ${130 - i * 4.2} l19 -4.2 l0 3 l-19 4.2 Z`} fill={c} opacity={0.9} />
      ))}
    </g>
  );
}

/** M.2 SSD 라벨 위 장식(구리 띠, 사선, 포인트 색) */
function ssd(label: { base: string; band?: string; text: string }, extra: ReactNode): ReactNode {
  return (
    <g>
      {m2(label)}
      {extra}
    </g>
  );
}

/* ───────────── 케이스·쿨러·OS ───────────── */

/** 쿠거 CONQUER 2: 쐐기 모양 알루미늄 오픈 프레임, 양쪽 강화유리, 주황 ARGB 선 */
function conquer2(): ReactNode {
  return (
    <g>
      <Shadow cx={100} cy={186} rx={80} ry={6} />
      <path d="M20 62 L118 30 L180 62 L180 150 L118 180 L20 150 Z" fill="#2b2d32" />
      <path d="M30 66 L114 39 L114 168 L30 144 Z" fill="#3d3b38" opacity={0.85} />
      <path d="M36 70 L70 59 L50 141 L36 138 Z" fill="#ffffff" opacity={0.08} />
      {/* 유리 안: 메인보드, 가로로 누운 그래픽카드 */}
      <rect x={54} y={66} width={46} height={60} fill="#16181c" />
      <rect x={60} y={72} width={14} height={14} fill="#9aa0a8" opacity={0.6} />
      <rect x={80} y={70} width={4} height={30} fill="#5a5c63" />
      <rect x={86} y={70} width={4} height={30} fill="#5a5c63" />
      <rect x={46} y={110} width={62} height={16} rx={2} fill="#232529" />
      {[60, 77, 94].map((cx) => (
        <circle key={cx} cx={cx} cy={118} r={6} fill="#0e0e10" />
      ))}
      {/* 앞쪽 면과 유리 */}
      <path d="M118 30 L180 62 L180 150 L118 180 Z" fill="#1f2125" />
      <path d="M124 42 L174 66 L174 146 L124 168 Z" fill="#3d3b38" opacity={0.7} />
      <path d="M20 62 L118 30 L180 62" fill="none" stroke="#ff7a1a" strokeWidth={2.5} />
      <path d="M20 150 L118 180 L180 150" fill="none" stroke="#ff7a1a" strokeWidth={2.5} opacity={0.8} />
      <path d="M118 30 L118 180" stroke="#8e939b" strokeWidth={3} />
      <rect x={24} y={148} width={12} height={8} fill="#111" />
      <rect x={164} y={150} width={12} height={8} fill="#111" />
    </g>
  );
}

/** NZXT KRAKEN Z73: 360mm 라디에이터와 팬 셋, 둥근 LCD 펌프 헤드 */
function krakenZ73(): ReactNode {
  return (
    <g>
      <Shadow cx={100} cy={184} rx={80} ry={5} />
      <rect x={10} y={22} width={180} height={66} rx={4} fill="#17181b" />
      <rect x={10} y={22} width={180} height={6} rx={3} fill="#2b2d32" />
      <rect x={10} y={82} width={180} height={6} rx={3} fill="#2b2d32" />
      {[40, 100, 160].map((cx) => (
        <Fan key={cx} cx={cx} cy={55} r={27} frame="#121214" blade="#25262b" bladeEdge="#3a3c43" blades={7} />
      ))}
      <path d="M172 88 C 186 120, 156 136, 132 136" fill="none" stroke="#141416" strokeWidth={9} />
      <path d="M184 88 C 200 132, 160 152, 134 150" fill="none" stroke="#141416" strokeWidth={9} />
      <circle cx={100} cy={142} r={37} fill="#1b1c20" />
      <circle cx={100} cy={142} r={31} fill="#0a0c12" />
      <circle cx={100} cy={142} r={26} fill="none" stroke="#7b3fe4" strokeWidth={4} />
      <circle cx={100} cy={142} r={19} fill="none" stroke="#3db8ff" strokeWidth={3} strokeDasharray="60 60" />
      <rect x={88} y={135} width={24} height={7} rx={1} fill="#e8e8ec" />
      <rect x={92} y={146} width={16} height={3} fill="#9aa0a8" />
      <path d="M74 126 A 31 31 0 0 1 116 114" fill="none" stroke="#ffffff" strokeOpacity={0.14} strokeWidth={4} />
    </g>
  );
}

/** 녹투아 NH-U14S TR5-SP6: 긴 싱글 타워, 베이지·갈색 140mm 팬, 넓은 베이스 */
function nhU14sTr5(): ReactNode {
  return (
    <g>
      <Shadow cx={100} cy={184} rx={66} ry={5} />
      {range(6).map((i) => (
        <circle key={i} cx={84 + i * 9} cy={23} r={3.2} fill="#c98a4b" />
      ))}
      <rect x={72} y={26} width={84} height={130} fill="#b8bcc2" />
      {range(34).map((i) => (
        <rect key={i} x={72} y={28 + i * 3.8} width={84} height={1.2} fill="#7f838a" />
      ))}
      <rect x={72} y={26} width={84} height={6} fill="#e6e8eb" />
      <rect x={146} y={26} width={10} height={130} fill="#000" opacity={0.12} />
      <rect x={38} y={34} width={72} height={114} rx={7} fill="#d8c3a5" />
      <rect x={38} y={34} width={72} height={20} rx={7} fill="#ffffff" opacity={0.18} />
      <Fan cx={74} cy={91} r={32} frame="#d8c3a5" blade="#6b3f2b" bladeEdge="#8a5640" hub="#d8c3a5" blades={7} />
      {[
        [40, 36],
        [100, 36],
        [40, 138],
        [100, 138],
      ].map(([px, py]) => (
        <rect key={`${px}-${py}`} x={px} y={py} width={8} height={8} rx={2} fill="#6b3f2b" />
      ))}
      <rect x={76} y={156} width={76} height={16} rx={2} fill="#c3c6cc" />
      <rect x={76} y={156} width={76} height={5} fill="#ffffff" opacity={0.4} />
      {range(6).map((i) => (
        <rect key={i} x={82 + i * 11} y={162} width={6} height={10} fill="#c98a4b" />
      ))}
    </g>
  );
}

/** Windows 11 Pro 처음 사용자용: 파란 꽃잎을 겹친 추상 무늬의 상자와 USB 메모리(로고 없이) */
function windows11Retail(): ReactNode {
  return (
    <g>
      <Shadow cx={100} cy={180} rx={70} ry={5} />
      <path d="M52 30 L60 24 L144 24 L136 30 Z" fill="#d7dbe3" />
      <path d="M136 30 L144 24 L144 166 L136 172 Z" fill="#9aa3b5" />
      <rect x={52} y={30} width={84} height={142} fill="#0b2b6b" />
      <path d="M52 118 C 76 80, 116 70, 136 90 L136 172 L52 172 Z" fill="#1a4fb5" />
      <path d="M64 172 C 76 122, 116 110, 136 128 L136 172 Z" fill="#3d7bea" />
      <path d="M92 172 C 102 148, 124 140, 136 150 L136 172 Z" fill="#8fc0ff" />
      <rect x={52} y={30} width={84} height={26} fill="#ffffff" />
      <rect x={60} y={38} width={40} height={4} fill="#1b1b1f" />
      <rect x={60} y={46} width={26} height={3} fill="#5f636b" />
      <g transform="rotate(-16 140 152)">
        <rect x={112} y={144} width={56} height={18} rx={4} fill="#e9ebef" />
        <rect x={112} y={144} width={56} height={6} rx={3} fill="#ffffff" opacity={0.6} />
        <rect x={166} y={147} width={14} height={12} rx={1} fill="#b9bdc4" />
        <rect x={118} y={148} width={22} height={10} rx={2} fill="#2f6fe0" />
      </g>
    </g>
  );
}

/* ───────────── 키보드: 커스텀 텐키리스 ───────────── */

type Tkl = { top: string; side: string; alpha: string; mod: string; accent: string; cable: string; badge?: string };

/** 키 한 줄: 숫자는 키 너비(단위 u), 음수는 그만큼 띄운다. a=글자 키, m=기능 키, x=포인트 키 */
type KeyRow = [number, "a" | "m" | "x"][];

/**
 * 텐키리스(87키) 배열: 본체 15u + 0.5u 띄우고 편집키 묶음 3u.
 * 기능키 줄은 Esc 뒤 1u, 네 개 묶음 사이 0.5u를 띄운다.
 */
const TKL_ROWS: KeyRow[] = [
  [
    [1, "x"],
    [-1, "a"],
    ...Array<[number, "m"]>(4).fill([1, "m"]),
    [-0.5, "a"],
    ...Array<[number, "a"]>(4).fill([1, "a"]),
    [-0.5, "a"],
    ...Array<[number, "m"]>(4).fill([1, "m"]),
  ],
  [...Array<[number, "a"]>(13).fill([1, "a"]), [2, "m"]],
  [[1.5, "m"], ...Array<[number, "a"]>(12).fill([1, "a"]), [1.5, "m"]],
  [[1.75, "m"], ...Array<[number, "a"]>(11).fill([1, "a"]), [2.25, "x"]],
  [[2.25, "m"], ...Array<[number, "a"]>(10).fill([1, "a"]), [2.75, "m"]],
  [
    [1.25, "m"],
    [1.25, "m"],
    [1.25, "m"],
    [6.25, "a"],
    [1.25, "m"],
    [1.25, "m"],
    [1.25, "m"],
    [1.25, "m"],
  ],
];

function customTkl({ top, side, alpha, mod, accent, cable, badge }: Tkl): ReactNode {
  const u = 8.4;
  const x0 = 22;
  const rowY = (r: number) => 66 + (r === 0 ? 0 : (r + 0.5) * u);
  const color = { a: alpha, m: mod, x: accent };
  const key = (x: number, y: number, w: number, fill: string, k: string) => (
    <g key={k}>
      <rect x={x + 0.5} y={y} width={w - 1} height={u - 1} rx={1.4} fill={fill} />
      <rect x={x + 0.5} y={y} width={w - 1} height={2.4} rx={1.2} fill="#ffffff" opacity={0.3} />
    </g>
  );
  const nav = x0 + 15.5 * u;
  return (
    <g>
      <Shadow cx={100} cy={154} rx={88} ry={7} />
      <path d="M14 70 L186 70 L192 146 L8 146 Z" fill={side} />
      <path d="M8 146 L192 146 L190 152 L10 152 Z" fill="#000" opacity={0.45} />
      <path d="M18 58 L182 58 L188 142 L12 142 Z" fill={top} />
      <path d="M18 58 L182 58 L183 66 L17 66 Z" fill="#ffffff" opacity={0.16} />
      {badge && <rect x={152} y={60} width={22} height={3.5} rx={1} fill={badge} />}
      {TKL_ROWS.map((row, r) => {
        let x = x0;
        return row.map(([w, kind], i) => {
          const at = x;
          x += Math.abs(w) * u;
          return w < 0 ? null : key(at, rowY(r), w * u, color[kind], `${r}-${i}`);
        });
      })}
      {/* 편집키 묶음과 방향키 */}
      {[0, 1, 2].map((r) => range(3).map((i) => key(nav + i * u, rowY(r), u, mod, `n${r}-${i}`)))}
      {key(nav + u, rowY(4), u, mod, "up")}
      {range(3).map((i) => key(nav + i * u, rowY(5), u, mod, `ar${i}`))}
      <path d="M100 58 C 100 42, 136 40, 146 22 C 150 14, 160 14, 164 20" fill="none" stroke={cable} strokeWidth={3} strokeLinecap="round" />
    </g>
  );
}

/* ───────────── 마이크 ───────────── */

/** 슈어 SM7B 계열: 큰 폼 윈드스크린, 긴 몸통, 요크와 큰 노브. SM7dB는 뒤쪽에 프리앰프 스위치가 있다 */
function shureSm7({ preamp }: { preamp: boolean }): ReactNode {
  return (
    <g>
      <Shadow cx={100} cy={180} rx={54} ry={5} />
      <rect x={96} y={112} width={8} height={62} fill="#2a2b30" />
      <ellipse cx={100} cy={174} rx={32} ry={6} fill="#1c1d21" />
      <path d="M84 120 L84 100 L128 100 L128 120" fill="none" stroke="#1d1e22" strokeWidth={7} />
      {/* 몸통 */}
      <rect x={62} y={64} width={112} height={38} rx={9} fill="#1b1c20" />
      <rect x={62} y={64} width={112} height={11} rx={7} fill="#ffffff" opacity={0.08} />
      <rect x={160} y={68} width={14} height={30} rx={6} fill={preamp ? "#3a3c42" : "#26272c"} />
      {/* 큰 폼 윈드스크린 */}
      <rect x={16} y={54} width={56} height={58} rx={22} fill="#121214" />
      <Perforation x={20} y={58} w={48} h={50} gap={3.4} r={0.8} fill="#3a3b40" opacity={0.6} />
      <rect x={20} y={58} width={40} height={14} rx={10} fill="#ffffff" opacity={0.05} />
      {/* 요크 노브 */}
      <circle cx={118} cy={83} r={11} fill="#2f3036" />
      <circle cx={118} cy={83} r={6} fill="#46474e" />
      {/* XLR 단자 */}
      <rect x={174} y={74} width={8} height={18} rx={2} fill="#2b2c31" />
      {preamp && (
        <g>
          <rect x={136} y={102} width={24} height={7} rx={1} fill="#2b2c31" />
          <rect x={140} y={103.5} width={5} height={4} fill="#c9ccd1" />
          <rect x={150} y={103.5} width={5} height={4} fill="#c9ccd1" />
        </g>
      )}
    </g>
  );
}

/** 슈어 MV7+: 짧은 캡슐형 몸통, 둥근 앞 그릴, 윗면 LED 터치 막대, 작은 탁상 스탠드 */
function mv7Plus(): ReactNode {
  return (
    <g>
      <Shadow cx={100} cy={178} rx={46} ry={5} />
      <path d="M100 132 L72 174 M100 132 L128 174 M100 132 L100 176" stroke="#1f2024" strokeWidth={5} strokeLinecap="round" />
      <rect x={96} y={108} width={8} height={26} fill="#2a2b30" />
      <path d="M78 112 L78 96 L124 96 L124 112" fill="none" stroke="#1d1e22" strokeWidth={6} />
      <g transform="rotate(-14 100 82)">
        <rect x={40} y={62} width={124} height={40} rx={18} fill="#1a1b1f" />
        <rect x={40} y={62} width={124} height={12} rx={10} fill="#ffffff" opacity={0.08} />
        <rect x={40} y={62} width={40} height={40} rx={18} fill="#232428" />
        <Perforation x={44} y={66} w={32} h={32} gap={3} r={0.8} fill="#4a4c53" opacity={0.7} />
        {["#3db8ff", "#7c5cff", "#ff4fd8", "#ff8a3d", "#ffd43b"].map((c, i) => (
          <rect key={c} x={96 + i * 9} y={58} width={8} height={3} rx={1} fill={c} />
        ))}
        <circle cx={118} cy={82} r={9} fill="#2f3036" />
        <rect x={160} y={74} width={8} height={16} rx={2} fill="#2b2c31" />
      </g>
    </g>
  );
}

/* ───────────── 헤드폰 ───────────── */

function headband(): ReactNode {
  return (
    <g>
      <path d="M40 106 C 40 32, 160 32, 160 106" fill="none" stroke="#1c1d21" strokeWidth={9} />
      <path d="M58 64 C 76 46, 124 46, 142 64" fill="none" stroke="#2b2c31" strokeWidth={12} strokeLinecap="round" />
      <rect x={34} y={98} width={12} height={22} rx={3} fill="#2a2a2e" />
      <rect x={154} y={98} width={12} height={22} rx={3} fill="#2a2a2e" />
    </g>
  );
}

/** HD 820: 밀폐형, 오목한 강화유리 덮개 아래로 드라이버가 비치는 검은 컵 */
function hd820(): ReactNode {
  return (
    <g>
      <Shadow cx={100} cy={184} rx={72} ry={5} />
      {headband()}
      {[40, 160].map((cx) => (
        <g key={cx}>
          <ellipse cx={cx} cy={142} rx={30} ry={38} fill="#18191c" />
          <ellipse cx={cx} cy={142} rx={22} ry={29} fill="#0b0c0f" />
          <ellipse cx={cx} cy={142} rx={13} ry={17} fill="#2c3036" />
          <ellipse cx={cx} cy={142} rx={6} ry={8} fill="#5a6068" />
          <ellipse cx={cx} cy={142} rx={22} ry={29} fill="none" stroke="#8c9097" strokeWidth={1.5} />
          <ellipse cx={cx - 8} cy={128} rx={8} ry={12} fill="#ffffff" opacity={0.2} />
        </g>
      ))}
    </g>
  );
}

/** HD 800 S: 개방형, 큰 링 모양 하우징과 메시, 링 드라이버 */
function hd800s(): ReactNode {
  const mesh = (cx: number) =>
    range(16).map((i) => {
      const dy = -30 + i * 4;
      const half = 25 * Math.sqrt(Math.max(0, 1 - (dy / 32) ** 2));
      return <rect key={i} x={cx - half} y={142 + dy} width={half * 2} height={1.2} fill="#3a3c41" />;
    });
  return (
    <g>
      <Shadow cx={100} cy={186} rx={76} ry={5} />
      {headband()}
      {[40, 160].map((cx) => (
        <g key={cx}>
          <ellipse cx={cx} cy={142} rx={34} ry={42} fill="#2b2d31" />
          <ellipse cx={cx} cy={142} rx={34} ry={42} fill="none" stroke="#5c6068" strokeWidth={2} />
          <ellipse cx={cx} cy={142} rx={26} ry={33} fill="#141517" />
          {mesh(cx)}
          <ellipse cx={cx} cy={142} rx={12} ry={15} fill="none" stroke="#6a6e76" strokeWidth={3} />
          <circle cx={cx} cy={142} r={3} fill="#8c9097" />
          <ellipse cx={cx - 10} cy={124} rx={9} ry={13} fill="#ffffff" opacity={0.08} />
        </g>
      ))}
    </g>
  );
}

/** HE 1: 카라라 대리석 받침, 위로 올라온 석영 진공관 8개, 앞면 알루미늄 노브, 위에 얹은 은색 헤드폰 */
function he1(): ReactNode {
  return (
    <g>
      <Shadow cx={100} cy={186} rx={88} ry={5} />
      <rect x={12} y={110} width={176} height={70} rx={3} fill="#eceae6" />
      <rect x={12} y={110} width={176} height={10} fill="#ffffff" opacity={0.6} />
      <path d="M20 132 C 50 120, 70 150, 110 134 S 160 126, 184 144" fill="none" stroke="#a9a6a0" strokeWidth={1.4} opacity={0.6} />
      <path d="M30 168 C 60 150, 96 172, 130 156" fill="none" stroke="#b9b6b0" strokeWidth={1} opacity={0.6} />
      <path d="M140 118 C 150 136, 170 140, 186 160" fill="none" stroke="#a9a6a0" strokeWidth={1} opacity={0.5} />
      {range(8).map((i) => (
        <g key={i}>
          <rect x={30 + i * 18} y={80} width={11} height={32} rx={5.5} fill="#dfe8ee" opacity={0.55} />
          <rect x={33.5 + i * 18} y={96} width={4} height={13} fill="#ff9a3d" opacity={0.85} />
          <rect x={31 + i * 18} y={82} width={3} height={24} rx={1.5} fill="#ffffff" opacity={0.45} />
        </g>
      ))}
      {range(6).map((i) => (
        <g key={`k${i}`}>
          <rect x={30 + i * 26} y={180} width={12} height={6} rx={1} fill="#9da1a8" />
          <circle cx={36 + i * 26} cy={150} r={6} fill="#c9ccd1" />
          <circle cx={36 + i * 26} cy={150} r={6} fill="none" stroke="#8a8e95" strokeWidth={1} />
        </g>
      ))}
      {/* 위에 얹은 헤드폰 */}
      <path d="M44 66 C 44 18, 156 18, 156 66" fill="none" stroke="#5c6068" strokeWidth={6} />
      {[44, 156].map((cx) => (
        <g key={cx}>
          <ellipse cx={cx} cy={72} rx={20} ry={16} fill="#b9bdc4" />
          <ellipse cx={cx} cy={72} rx={14} ry={11} fill="#3a3c41" />
          <ellipse cx={cx} cy={72} rx={14} ry={11} fill="none" stroke="#e1e3e6" strokeWidth={1.5} />
        </g>
      ))}
    </g>
  );
}

/* ───────────── 신디사이저: 위에서 본 건반 악기 ───────────── */

/** 건반: 88건반은 A부터, 61건반은 C부터. 검은 건반은 C, D, F, G, A 뒤에 있다 */
function keybed(x: number, y: number, w: number, h: number, keys: 61 | 88): ReactNode {
  const whites = keys === 88 ? 52 : 36;
  const start = keys === 88 ? 0 : 2;
  const kw = w / whites;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#f3f1ec" />
      {range(whites - 1).map((i) => (
        <rect key={i} x={x + (i + 1) * kw - 0.3} y={y} width={0.6} height={h} fill="#9a9894" />
      ))}
      {range(whites - 1).map((i) => {
        const letter = "ABCDEFG"[(start + i) % 7];
        if (!"ACDFG".includes(letter)) return null;
        return <rect key={`b${i}`} x={x + (i + 1) * kw - kw * 0.32} y={y} width={kw * 0.64} height={h * 0.6} fill="#151517" />;
      })}
      <rect x={x} y={y} width={w} height={2} fill="#000" opacity={0.35} />
    </g>
  );
}

type Synth = { keys: 61 | 88; body: string; panel: string; wood?: string; wheel?: string; parts: ReactNode };

function synth({ keys, body, panel, wood, wheel = "#2a2b30", parts }: Synth): ReactNode {
  const x0 = wood ? 24 : 12;
  const x1 = wood ? 176 : 188;
  return (
    <g>
      <Shadow cx={100} cy={160} rx={92} ry={6} />
      {wood && (
        <g>
          <rect x={8} y={44} width={18} height={112} rx={4} fill={wood} />
          <rect x={174} y={44} width={18} height={112} rx={4} fill={wood} />
          {range(5).map((i) => (
            <g key={i}>
              <path
                d={`M${11 + i * 3} 48 C ${13 + i * 3} 90, ${9 + i * 3} 120, ${12 + i * 3} 152`}
                fill="none"
                stroke="#000"
                strokeOpacity={0.18}
                strokeWidth={0.8}
              />
              <path
                d={`M${177 + i * 3} 48 C ${179 + i * 3} 90, ${175 + i * 3} 120, ${178 + i * 3} 152`}
                fill="none"
                stroke="#000"
                strokeOpacity={0.18}
                strokeWidth={0.8}
              />
            </g>
          ))}
        </g>
      )}
      <rect x={x0} y={50} width={x1 - x0} height={104} rx={4} fill={body} />
      <rect x={x0} y={50} width={x1 - x0} height={8} rx={4} fill="#ffffff" opacity={0.1} />
      <rect x={x0 + 4} y={56} width={x1 - x0 - 8} height={48} rx={2} fill={panel} />
      {parts}
      {/* 피치·모듈레이션 휠 */}
      <rect x={x0 + 4} y={112} width={6} height={34} rx={2} fill={wheel} />
      <rect x={x0 + 12} y={112} width={6} height={34} rx={2} fill={wheel} />
      {keybed(x0 + 22, 110, x1 - x0 - 26, 38, keys)}
      <rect x={x0} y={148} width={x1 - x0} height={6} rx={2} fill="#000" opacity={0.3} />
    </g>
  );
}

/** 노브 한 줄 */
const knobs = (x: number, y: number, n: number, gap: number, r: number, fill = "#3a3c42") =>
  range(n).map((i) => (
    <g key={`${x}-${y}-${i}`}>
      <circle cx={x + i * gap} cy={y} r={r} fill={fill} />
      <circle cx={x + i * gap - r * 0.3} cy={y - r * 0.3} r={r * 0.35} fill="#ffffff" opacity={0.25} />
    </g>
  ));

/** 롤랜드 FANTOM-08: 검정 몸통, 가운데 컬러 터치스크린, 슬라이더, 오른쪽 패드 16개 */
function fantom08(): ReactNode {
  const pads = ["#ff3b5c", "#ff8a3d", "#ffd43b", "#3ddc84", "#3db8ff", "#7c5cff", "#ff4fd8", "#f5f5f2"];
  return synth({
    keys: 88,
    body: "#1a1b1e",
    panel: "#111214",
    parts: (
      <g>
        {knobs(24, 66, 8, 7.5, 2.6)}
        {knobs(24, 78, 8, 7.5, 2.6)}
        {range(8).map((i) => (
          <g key={i}>
            <rect x={23 + i * 7.5} y={86} width={2} height={14} fill="#000" />
            <rect x={21 + i * 7.5} y={90 + (i % 3) * 2} width={6} height={3} fill="#c9ccd1" />
          </g>
        ))}
        <rect x={86} y={62} width={44} height={28} rx={1} fill="#0a1220" />
        <rect x={89} y={65} width={38} height={6} fill="#3db8ff" opacity={0.8} />
        <rect x={89} y={74} width={24} height={4} fill="#ff8a3d" opacity={0.8} />
        <rect x={89} y={81} width={30} height={4} fill="#3ddc84" opacity={0.7} />
        {knobs(92, 96, 5, 8, 2.4)}
        {range(16).map((i) => (
          <rect
            key={`p${i}`}
            x={142 + (i % 4) * 9.5}
            y={60 + Math.floor(i / 4) * 10.5}
            width={8}
            height={8.5}
            rx={1}
            fill={pads[(i * 3) % pads.length]}
            opacity={0.85}
          />
        ))}
      </g>
    ),
  });
}

/** 야마하 MONTAGE M8x: 왼쪽 큰 슈퍼 노브(빛 고리), 가운데 넓은 터치스크린, 슬라이더 줄 */
function montageM8x(): ReactNode {
  return synth({
    keys: 88,
    body: "#141416",
    panel: "#1d1e22",
    parts: (
      <g>
        <circle cx={34} cy={80} r={13} fill="#2a2b30" />
        <circle cx={34} cy={80} r={15.5} fill="none" stroke="#5b8cff" strokeWidth={2.5} />
        <circle cx={30} cy={76} r={4} fill="#ffffff" opacity={0.18} />
        {knobs(56, 66, 4, 8, 2.6)}
        {knobs(56, 78, 4, 8, 2.6)}
        <rect x={92} y={60} width={56} height={34} rx={1} fill="#0b1018" />
        <rect x={95} y={63} width={50} height={5} fill="#f5f5f2" opacity={0.85} />
        {range(4).map((i) => (
          <rect key={i} x={95 + i * 12.5} y={71} width={11} height={19} fill={["#3db8ff", "#7c5cff", "#ff4fd8", "#ffd43b"][i]} opacity={0.55} />
        ))}
        {range(8).map((i) => (
          <g key={`s${i}`}>
            <rect x={155 + (i % 4) * 7.5} y={i < 4 ? 60 : 82} width={2} height={18} fill="#000" />
            <rect x={153 + (i % 4) * 7.5} y={(i < 4 ? 66 : 88) + (i % 2) * 3} width={6} height={3} fill="#c9ccd1" />
          </g>
        ))}
        {range(6).map((i) => (
          <rect key={`b${i}`} x={56 + i * 6} y={92} width={4.5} height={4} rx={0.8} fill="#e8e8ec" opacity={0.75} />
        ))}
      </g>
    ),
  });
}

/** 노드 스테이지 4 88: 빨간 몸통, 오르간 드로바, 작은 OLED, 돌 피치 스틱 */
function nordStage4(): ReactNode {
  const drawbarColors = ["#7a4a2a", "#7a4a2a", "#f3f1ec", "#f3f1ec", "#151517", "#f3f1ec", "#151517", "#151517", "#f3f1ec"];
  return synth({
    keys: 88,
    body: "#c8102e",
    panel: "#b30d28",
    wheel: "#7d7f84",
    parts: (
      <g>
        {drawbarColors.map((c, i) => (
          <g key={i}>
            <rect x={22 + i * 5.6} y={60} width={3.6} height={34} rx={1} fill="#0d0d0e" />
            <rect x={21.5 + i * 5.6} y={60 + (i % 4) * 5} width={4.6} height={12} rx={1} fill={c} />
          </g>
        ))}
        <rect x={80} y={62} width={20} height={9} rx={1} fill="#0a0a0c" />
        <rect x={82} y={65} width={12} height={2} fill="#f5f5f2" opacity={0.8} />
        <rect x={140} y={62} width={20} height={9} rx={1} fill="#0a0a0c" />
        <rect x={142} y={65} width={10} height={2} fill="#f5f5f2" opacity={0.8} />
        {knobs(84, 82, 4, 9, 3, "#2a2b30")}
        {knobs(144, 82, 4, 9, 3, "#2a2b30")}
        {range(10).map((i) => (
          <rect
            key={`l${i}`}
            x={110 + (i % 2) * 8}
            y={60 + Math.floor(i / 2) * 7}
            width={5}
            height={3}
            rx={0.6}
            fill={i % 3 === 0 ? "#ff6b6b" : "#3a0a12"}
          />
        ))}
        <path d="M24 98 H176" stroke="#f5f5f2" strokeOpacity={0.35} strokeWidth={0.8} />
      </g>
    ),
  });
}

/** 무그 원 16보이스: 호두나무 옆판, 검은 패널 가득한 은색 노브, 가운데 작은 화면, 61건반 */
function moogOne(): ReactNode {
  return synth({
    keys: 61,
    body: "#141414",
    panel: "#0e0e0f",
    wood: "#6b3f22",
    parts: (
      <g>
        {knobs(36, 64, 6, 7.6, 2.4, "#b9bcc2")}
        {knobs(36, 76, 6, 7.6, 2.4, "#b9bcc2")}
        {knobs(36, 88, 6, 7.6, 2.4, "#b9bcc2")}
        <rect x={86} y={60} width={30} height={20} rx={1} fill="#0b1218" />
        <rect x={89} y={64} width={24} height={2} fill="#f5f5f2" opacity={0.8} />
        <path d="M89 76 C 95 66, 101 74, 107 68 S 112 72, 113 70" fill="none" stroke="#5fd3ff" strokeWidth={1.2} />
        {knobs(90, 90, 4, 7, 2.6, "#b9bcc2")}
        {knobs(126, 64, 6, 7.6, 2.4, "#b9bcc2")}
        {knobs(126, 76, 6, 7.6, 2.4, "#b9bcc2")}
        {knobs(126, 88, 6, 7.6, 2.4, "#b9bcc2")}
        {range(12).map((i) => (
          <rect key={`b${i}`} x={32 + i * 11.6} y={98} width={6} height={3} rx={0.6} fill={i % 4 === 0 ? "#f5f5f2" : "#3a3b40"} />
        ))}
      </g>
    ),
  });
}

/* ───────────── 등록 ───────────── */

export const premiumModels: Record<string, () => ReactNode> = {
  "intel-core-i9-12900k": alderLake,
  "amd-ryzen-threadripper-pro-9995wx": () => threadripper(true),
  "amd-ryzen-threadripper-9980x": () => threadripper(false),
  "asus-rog-maximus-z690-extreme": () =>
    bigBoard({
      socket: "lga1700",
      pcb: "#0f1012",
      heatsink: "#26272b",
      heatsinkLight: "#c9ccd1",
      accent: "#ff3131",
      matrix: true,
      slots: 2,
      controls: true,
    }),
  "msi-mag-x870e-tomahawk-max-wifi-pz": () =>
    bigBoard({ socket: "am5", pcb: "#141518", heatsink: "#5b5f57", heatsinkLight: "#c9ccd1", accent: "#9aa4b1", backConnect: true, camo: true }),
  "msi-mag-z890-tomahawk-wifi-pz": () =>
    bigBoard({ socket: "lga1851", pcb: "#141518", heatsink: "#4f534b", heatsinkLight: "#c9ccd1", accent: "#9aa4b1", backConnect: true, camo: true }),
  "asus-pro-ws-trx50-sage-wifi": () =>
    bigBoard({ socket: "str5", pcb: "#16181b", heatsink: "#3a3d43", heatsinkLight: "#e6e8eb", accent: "#00a3e0", dimms: "split", slots: 5 }),
  "samsung-ddr5-4800-32gb": samsungStick,
  "gskill-trident-z5-rgb-ddr5-6400-96gb": tridentZ5Black,
  "corsair-dominator-titanium-rgb-ddr5-6600-96gb": dominatorTitanium,
  "gskill-zeta-r5-neo-ddr5-6400-128gb-rdimm": zetaR5,
  "asus-rog-strix-rtx-3090-o24g-gaming": strix3090,
  "gigabyte-rtx-4090-aero-oc-24g": aero4090,
  "nvidia-rtx-pro-6000-blackwell-server-edition": rtxProServer,
  "asus-rog-astral-rtx-5090-o32g-gaming": astral5090,
  "gigabyte-aorus-rtx-5090-xtreme-waterforce-wb": waterforceWb,
  "asus-rog-strix-riser-cable": riserCable,
  "asus-rog-thor-1200w-platinum-ii": rogThor,
  "samsung-980-pro-2tb": () =>
    ssd({ base: "#121214", band: "#24242a", text: "#e7e7e7" }, <rect x={22} y={113} width={158} height={3} fill="#b0703a" opacity={0.85} />),
  "sk-hynix-platinum-p51-2tb": () =>
    ssd(
      { base: "#0f0f11", band: "#3a3d44", text: "#d8dadd" },
      <g>
        <path d="M118 82 L136 82 L116 116 L98 116 Z" fill="#c9ccd1" opacity={0.35} />
        <rect x={150} y={108} width={22} height={2.5} fill="#ea002c" />
      </g>,
    ),
  "sk-hynix-platinum-p41-2tb": () =>
    ssd({ base: "#121214", band: "#5a5e66", text: "#cfd2d6" }, <path d="M128 82 L146 82 L126 116 L108 116 Z" fill="#9aa0a8" opacity={0.45} />),
  "sk-hynix-gold-p31-2tb": () =>
    ssd({ base: "#121214", band: "#c9a24a", text: "#c9a24a" }, <path d="M134 82 L144 82 L124 116 L114 116 Z" fill="#c9a24a" opacity={0.35} />),
  "cougar-conquer-2": conquer2,
  "nzxt-kraken-z73": krakenZ73,
  "noctua-nh-u14s-tr5-sp6": nhU14sTr5,
  "microsoft-windows-11-pro": windows11Retail,
  "lg-ultragear-oled-45gx950a": () =>
    monitor({ w: 194, h: 82, curve: 12, bezel: "#141416", stand: "#2b2c31", screen: ["#06101c", "#e84393", "#ffd166"], base: "plate", y: 40 }),
  "lg-ultragear-oled-39gx90sa": () =>
    monitor({ w: 176, h: 74, curve: 10, bezel: "#141416", stand: "#2b2c31", screen: ["#08101e", "#3db8ff", "#ff6a3d"], base: "plate", y: 44 }),
  "lg-ultragear-oled-32gx870a": () =>
    monitor({ w: 150, h: 86, curve: 0, bezel: "#151517", stand: "#2a2b30", screen: ["#0b0b14", "#7b3fe4", "#3ddc84"], base: "v", y: 34 }),
  "samsung-odyssey-neo-g9-57": () =>
    monitor({ w: 198, h: 56, curve: 10, bezel: "#18191c", stand: "#e3e5e9", screen: ["#070b18", "#1a9fff", "#ff3b5c"], base: "v", y: 58 }),
  "samsung-odyssey-ark-55-g97nc": () =>
    monitor({ w: 184, h: 104, curve: 10, bezel: "#1b1c1f", stand: "#c3c6cc", screen: ["#0a0a12", "#ff7a00", "#2fbf71"], base: "plate", y: 22 }),
  "samsung-odyssey-3d-g90xf": () => (
    <g>
      {monitor({ w: 140, h: 80, curve: 0, bezel: "#141416", stand: "#2b2c31", screen: ["#0b0f1a", "#00c2a8", "#ff4fd8"], base: "v", y: 40 })}
      {/* 눈 추적 카메라와 입체로 떠 보이는 도형 */}
      <rect x={90} y={35} width={20} height={6} rx={2} fill="#2b2c31" />
      <circle cx={95} cy={38} r={1.4} fill="#3db8ff" />
      <circle cx={105} cy={38} r={1.4} fill="#3db8ff" />
      <path d="M86 70 l14 -10 l14 10 l-14 10 Z" fill="none" stroke="#ff4fd8" strokeWidth={2} />
      <path d="M90 72 l14 -10 l14 10 l-14 10 Z" fill="none" stroke="#3db8ff" strokeWidth={2} opacity={0.8} />
    </g>
  ),
  "keycult-no-2-tkl": () =>
    customTkl({ top: "#b3b7be", side: "#8a8e96", alpha: "#ece7dc", mod: "#4c5058", accent: "#c9a45a", cable: "#d9d4c8", badge: "#c9a45a" }),
  "geonworks-f1-8x-v2": () => customTkl({ top: "#26334a", side: "#18202f", alpha: "#d9dbde", mod: "#7a808a", accent: "#e86a2c", cable: "#e86a2c" }),
  "shure-sm7db": () => shureSm7({ preamp: true }),
  "shure-sm7b": () => shureSm7({ preamp: false }),
  "shure-mv7-plus": mv7Plus,
  "sennheiser-he-1": he1,
  "sennheiser-hd-820": hd820,
  "sennheiser-hd-800-s": hd800s,
  "roland-fantom-08": fantom08,
  "yamaha-montage-m8x": montageM8x,
  "nord-stage-4-88": nordStage4,
  "moog-one-16-voice": moogOne,
};
