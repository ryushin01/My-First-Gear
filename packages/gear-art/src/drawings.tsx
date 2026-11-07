import type { ReactNode } from "react";

/**
 * 상품 그림. 모두 200×200 좌표에 선 위주로 그린다.
 * 로고, 엠블럼, 상표 문양은 넣지 않는다.
 * a = 강조 색, v = 모양 변형
 */
export type Drawing = (a: string, v?: string) => ReactNode;

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

const cpu: Drawing = (a, v) => (
  <>
    <rect x="45" y="45" width="110" height="110" rx="6" />
    <rect x="70" y="70" width="60" height="60" rx="4" fill={a} fillOpacity="0.18" stroke={a} />
    {v === "lga"
      ? range(9).map((i) => <circle key={i} cx={58 + i * 10.5} cy="56" r="1.4" fill="currentColor" stroke="none" />)
      : range(7).map((i) => <path key={i} d={`M${62 + i * 13} 45 v-10 M${62 + i * 13} 155 v10`} />)}
    {v !== "lga" && range(7).map((i) => <path key={`s${i}`} d={`M45 ${62 + i * 13} h-10 M155 ${62 + i * 13} h10`} />)}
    <path d="M52 148 l8 -8" stroke={a} />
    <path d="M82 92 h36 M82 100 h24 M82 108 h30" strokeWidth="1.5" />
  </>
);

const mainboard: Drawing = (a, v) => {
  const w = v === "matx" ? 120 : 140;
  const h = v === "matx" ? 130 : 160;
  const x = 100 - w / 2;
  const y = 100 - h / 2;
  return (
    <>
      <rect x={x} y={y} width={w} height={h} rx="4" />
      <rect x={x + 18} y={y + 18} width="40" height="40" rx="2" stroke={a} />
      <rect x={x + 26} y={y + 26} width="24" height="24" fill={a} fillOpacity="0.25" stroke="none" />
      {range(4).map((i) => (
        <rect key={i} x={x + w - 34 + i * 7} y={y + 12} width="4" height="62" fill="currentColor" fillOpacity="0.2" />
      ))}
      <rect x={x + 10} y={y + h - 62} width={w - 20} height="7" stroke={a} />
      <rect x={x + 10} y={y + h - 34} width={w - 40} height="5" />
      <rect x={x + 22} y={y + 72} width="60" height="12" rx="2" strokeDasharray="3 3" />
      <path d={`M${x} ${y + 24} h-6 v24 h6`} />
      {range(5).map((i) => (
        <circle key={`c${i}`} cx={x + 70 + i * 8} cy={y + h - 14} r="2.5" />
      ))}
    </>
  );
};

const memory: Drawing = (a, v) => (
  <>
    {[0, 1].map((n) => {
      const y = 62 + n * 46;
      return (
        <g key={n}>
          <path d={`M30 ${y} h140 v26 h-66 v4 h-8 v-4 h-66 z`} />
          {range(8).map((i) => (
            <rect key={i} x={38 + i * 16} y={y + 6} width="11" height="12" fill={a} fillOpacity="0.3" stroke="none" />
          ))}
          {v === "rgb" && <path d={`M30 ${y - 6} h140`} stroke={a} strokeWidth="4" strokeLinecap="round" />}
          {range(18).map((i) => (
            <path key={`p${i}`} d={`M${34 + i * 7.6} ${y + 26} v4`} strokeWidth="1.2" />
          ))}
        </g>
      );
    })}
  </>
);

const gpu: Drawing = (a, v) => {
  const fans = v === "dual" ? 2 : 3;
  const width = v === "dual" ? 128 : 170;
  const x = 100 - width / 2;
  const fanGap = width / fans;
  return (
    <>
      <rect x={x} y="62" width={width} height="72" rx="8" />
      {range(fans).map((i) => {
        const cx = x + fanGap * i + fanGap / 2;
        return (
          <g key={i}>
            <circle cx={cx} cy="98" r="26" />
            <circle cx={cx} cy="98" r="7" fill={a} stroke={a} />
            {range(7).map((b) => (
              <path
                key={b}
                d={`M${cx} 98 q 10 -8 0 -22`}
                transform={`rotate(${b * (360 / 7)} ${cx} 98)`}
                strokeWidth="1.5"
              />
            ))}
          </g>
        );
      })}
      <path d={`M${x + 16} 134 v10 h${width * 0.55} v-10`} stroke={a} />
      <path d={`M${x} 70 h-8 v56 h8`} />
    </>
  );
};

const storage: Drawing = (a) => (
  <>
    <rect x="22" y="80" width="156" height="40" rx="3" />
    <path d="M22 88 h-6 v24 h6" />
    {range(10).map((i) => (
      <path key={i} d={`M${18} ${90 + i * 2} h-0`} />
    ))}
    <rect x="40" y="88" width="30" height="24" fill={a} fillOpacity="0.3" stroke={a} />
    <rect x="80" y="88" width="24" height="24" />
    <rect x="112" y="88" width="24" height="24" />
    <circle cx="166" cy="100" r="5" />
    <path d="M44 128 h40" strokeWidth="1.5" />
  </>
);

const psu: Drawing = (a, v) => {
  const size = v === "sfx" ? 100 : 130;
  const x = 100 - size / 2;
  const y = 100 - (size * 0.72) / 2;
  const h = size * 0.72;
  return (
    <>
      <rect x={x} y={y} width={size} height={h} rx="5" />
      <circle cx={x + size * 0.42} cy={y + h / 2} r={h * 0.36} />
      {range(5).map((i) => (
        <circle key={i} cx={x + size * 0.42} cy={y + h / 2} r={h * (0.08 + i * 0.065)} strokeWidth="1" />
      ))}
      <rect x={x + size * 0.8} y={y + 12} width={size * 0.12} height={h * 0.4} fill={a} fillOpacity="0.3" stroke={a} />
      <path d={`M${x + size * 0.8} ${y + h - 14} h${size * 0.12}`} />
    </>
  );
};

const pcCase: Drawing = (a, v) => {
  if (v === "open") {
    // 오픈 프레임: 기울어진 판 위에 부품을 드러낸 구조
    return (
      <>
        <path d="M60 30 L150 42 L150 168 L60 156 Z" />
        <path d="M60 30 L44 40 L44 166 L60 156" />
        <path d="M150 168 L170 176 M60 156 L40 178" stroke={a} strokeWidth="4" strokeLinecap="round" />
        <path d="M150 42 L170 30" stroke={a} strokeWidth="4" strokeLinecap="round" />
        <rect x="76" y="58" width="52" height="60" transform="skewY(7.6)" strokeWidth="1.5" />
        <path d="M74 136 L136 144 L136 158 L74 150 Z" fill={a} fillOpacity="0.22" stroke={a} />
        <circle cx="100" cy="80" r="11" strokeWidth="1.5" />
      </>
    );
  }
  const w = v === "itx" ? 110 : 96;
  const h = v === "itx" ? 96 : 150;
  const x = 100 - w / 2;
  const y = 100 - h / 2;
  return (
    <>
      <rect x={x} y={y} width={w} height={h} rx="6" />
      {v === "wood"
        ? range(9).map((i) => (
            <path key={i} d={`M${x + 10 + i * 9} ${y + 10} v${h - 20}`} stroke={a} strokeWidth="5" strokeOpacity="0.55" />
          ))
        : (
          <rect x={x + 10} y={y + 10} width={w - 20} height={h - 20} rx="3" fill={a} fillOpacity="0.12" stroke={a} />
        )}
      <circle cx={x + w - 14} cy={y + 8} r="2.5" fill="currentColor" stroke="none" />
      <path d={`M${x + 8} ${y + h} v8 M${x + w - 8} ${y + h} v8`} />
    </>
  );
};

const cooler: Drawing = (a) => (
  <>
    {[48, 112].map((x) => (
      <g key={x}>
        <rect x={x} y="40" width="40" height="100" rx="3" />
        {range(11).map((i) => (
          <path key={i} d={`M${x} ${48 + i * 8.5} h40`} strokeWidth="1" />
        ))}
      </g>
    ))}
    <rect x="86" y="54" width="28" height="74" rx="4" fill={a} fillOpacity="0.25" stroke={a} />
    <path d="M92 140 v18 M100 140 v18 M108 140 v18" />
    <rect x="80" y="156" width="40" height="10" rx="2" />
  </>
);

const keyboard: Drawing = (a) => (
  <>
    <rect x="16" y="62" width="168" height="78" rx="8" />
    {range(4).map((row) =>
      range(row === 3 ? 4 : 12).map((col) => {
        if (row === 3) {
          const widths = [20, 20, 76, 20];
          const offsets = [26, 50, 74, 154];
          return <rect key={`${row}-${col}`} x={offsets[col]} y={72 + row * 16} width={widths[col]} height="11" rx="2" />;
        }
        const accent = row === 0 && col === 0;
        return (
          <rect
            key={`${row}-${col}`}
            x={26 + col * 12.6 + (row === 2 ? 4 : 0)}
            y={72 + row * 16}
            width="9.5"
            height="11"
            rx="2"
            fill={accent ? a : "none"}
            stroke={accent ? a : "currentColor"}
          />
        );
      }),
    )}
    <path d="M100 62 q 0 -20 30 -30" strokeDasharray="4 3" />
  </>
);

const laptop: Drawing = (a, v) => {
  const w = v === "wide" ? 150 : 132;
  const x = 100 - w / 2;
  return (
    <>
      <rect x={x} y="44" width={w} height="90" rx="6" />
      <rect x={x + 8} y="52" width={w - 16} height="74" rx="2" fill={a} fillOpacity="0.16" stroke={a} />
      <path d={`M${x - 16} 140 h${w + 32} l-8 10 h-${w + 16} z`} />
      <path d={`M${100 - 14} 140 h28`} strokeWidth="1.5" />
      <path d={`M${x + 20} 70 l24 24 M${x + 30} 66 l40 40`} stroke={a} strokeWidth="1.2" strokeOpacity="0.6" />
    </>
  );
};

const dap: Drawing = (a, v) => {
  if (v === "walkman") {
    // 둥근 모서리 바디, 위쪽 화면, 오른쪽 옆면 버튼, 아래쪽 단자의 워크맨형
    return (
      <>
        <rect x="64" y="22" width="72" height="156" rx="14" />
        <rect x="70" y="28" width="60" height="144" rx="10" stroke={a} strokeWidth="1.5" />
        <rect x="76" y="38" width="48" height="74" rx="3" fill={a} fillOpacity="0.16" stroke={a} />
        <path d="M136 58 h5 v14 h-5 M136 80 h5 v8 h-5 M136 94 h5 v8 h-5 M136 108 h5 v8 h-5" strokeWidth="2" />
        <path d="M86 128 h28 M86 138 h20" strokeWidth="1.5" />
        <circle cx="84" cy="164" r="4" />
        <circle cx="116" cy="164" r="5" fill={a} fillOpacity="0.5" stroke={a} />
        <path d="M84 90 q 16 -30 32 -6" stroke={a} strokeWidth="1.2" />
        <path d="M84 102 h32" strokeWidth="1" strokeDasharray="2 3" />
      </>
    );
  }
  return (
  <>
    <path d="M62 26 h66 l10 10 v134 l-8 8 h-68 l-8 -8 v-136 z" />
    <rect x="66" y="36" width="64" height="96" rx="2" fill={a} fillOpacity="0.18" stroke={a} />
    <path d="M140 60 l10 -6 v40 l-10 -6" />
    <circle cx="74" cy="152" r="4" />
    <circle cx="90" cy="152" r="5" />
    <path d="M110 150 h20" />
    <path d="M78 110 q 20 -40 40 -10" stroke={a} strokeWidth="1.2" />
  </>
  );
};

const earphone: Drawing = (a, v) => {
  if (v === "iem") {
    return (
      <>
        {[70, 130].map((cx, i) => (
          <g key={cx} transform={i ? `scale(-1 1) translate(-200 0)` : undefined}>
            <path d="M48 70 q 24 -24 46 0 q 8 30 -20 42 q -30 4 -26 -42 z" fill={a} fillOpacity="0.2" stroke={a} />
            <path d="M74 112 q 4 20 -4 40 q -6 18 30 30" />
          </g>
        ))}
      </>
    );
  }
  return (
    <>
      <rect x="54" y="110" width="92" height="56" rx="26" />
      <path d="M54 136 h92" strokeWidth="1.2" />
      <circle cx="100" cy="124" r="3" fill={a} stroke="none" />
      {[74, 126].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="70" r="20" />
          <circle cx={cx} cy="70" r="8" fill={a} fillOpacity="0.35" stroke={a} />
        </g>
      ))}
    </>
  );
};

const headphone: Drawing = (a, v) => (
  <>
    <path d="M44 120 v-26 a56 56 0 0 1 112 0 v26" strokeWidth="5" />
    <path d="M54 100 a46 46 0 0 1 92 0" strokeWidth="1.2" />
    {[38, 162].map((cx) => (
      <g key={cx}>
        <rect x={cx - 18} y="104" width="36" height="58" rx="16" />
        {v === "open"
          ? range(5).map((i) => <path key={i} d={`M${cx - 10} ${116 + i * 8} h20`} stroke={a} strokeWidth="1.5" />)
          : <rect x={cx - 11} y="114" width="22" height="38" rx="10" fill={a} fillOpacity="0.28" stroke={a} />}
      </g>
    ))}
  </>
);

const consoleDrawing: Drawing = (a, v) => {
  if (v === "tower") {
    return (
      <>
        <path d="M70 30 q -16 70 0 140 h22 v-140 z" />
        <path d="M130 30 q 16 70 0 140 h-22 v-140 z" />
        <rect x="92" y="30" width="16" height="140" fill={a} fillOpacity="0.3" stroke={a} />
        <path d="M60 176 h80" />
      </>
    );
  }
  return (
    <>
      <rect x="54" y="62" width="92" height="66" rx="4" />
      <rect x="62" y="70" width="76" height="50" rx="2" fill={a} fillOpacity="0.14" stroke={a} strokeWidth="1.5" />
      <rect x="18" y="58" width="34" height="74" rx="14" fill={a} fillOpacity="0.4" stroke={a} />
      <rect x="148" y="58" width="34" height="74" rx="14" fill="#2896ff" fillOpacity="0.4" stroke="#2896ff" />
      <circle cx="35" cy="80" r="6" />
      <circle cx="165" cy="108" r="6" />
      <path d="M30 108 h10 M35 103 v10" />
      {[[160, 76], [170, 84], [160, 92], [150, 84]].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.5" />
      ))}
    </>
  );
};

const bicycle: Drawing = (a) => (
  <>
    {/* 삼각형 프레임의 접이식 자전거 */}
    <circle cx="52" cy="142" r="28" />
    <circle cx="148" cy="142" r="28" />
    <circle cx="52" cy="142" r="4" />
    <circle cx="148" cy="142" r="4" />
    <path d="M52 142 L104 40 L148 142 Z" stroke={a} strokeWidth="5" strokeLinejoin="round" fill="none" />
    <path d="M104 40 L92 32 M104 40 L118 36" strokeWidth="4" strokeLinecap="round" />
    <path d="M78 92 L60 84 h-12" strokeWidth="3" />
    <path d="M52 142 h96" strokeDasharray="4 4" strokeWidth="1.5" />
  </>
);

const motorcycle: Drawing = (a) => (
  <>
    <circle cx="46" cy="136" r="30" />
    <circle cx="156" cy="136" r="30" />
    <circle cx="46" cy="136" r="12" strokeWidth="1.5" />
    <circle cx="156" cy="136" r="12" strokeWidth="1.5" />
    <path
      d="M46 136 L82 96 L124 92 L146 70 L170 76 L166 98 L156 136"
      fill={a}
      fillOpacity="0.22"
      stroke={a}
      strokeLinejoin="round"
    />
    <path d="M66 86 L104 74 L136 80" strokeWidth="3" />
    <path d="M146 70 L140 58 L160 60" />
    <path d="M90 104 h30 v18 h-30 z" strokeWidth="1.5" />
    <path d="M62 108 L44 102" strokeWidth="4" strokeLinecap="round" />
  </>
);

const car: Drawing = (a, v) => {
  if (v === "supercar") {
    return (
      <>
        <path
          d="M14 128 L30 108 L86 96 L118 76 L150 80 L186 106 L188 128 Z"
          fill={a}
          fillOpacity="0.22"
          stroke={a}
          strokeLinejoin="round"
        />
        <path d="M92 96 L120 82 L144 86 L160 102 Z" strokeWidth="1.5" />
        <path d="M30 116 L64 112 M150 112 L176 114" strokeWidth="1.5" />
        <circle cx="52" cy="130" r="18" />
        <circle cx="152" cy="130" r="18" />
        <circle cx="52" cy="130" r="7" />
        <circle cx="152" cy="130" r="7" />
        <path d="M14 140 h174" strokeWidth="1" strokeDasharray="3 4" />
      </>
    );
  }
  return (
    <>
      <path
        d="M12 128 L16 108 L48 102 L76 78 L136 78 L162 102 L188 108 L190 128 Z"
        fill={a}
        fillOpacity="0.18"
        stroke={a}
        strokeLinejoin="round"
      />
      <path d="M58 102 L80 84 h28 v18 Z M114 84 h20 l18 18 h-38 Z" strokeWidth="1.5" />
      <path d="M12 116 h14 M176 116 h14" strokeWidth="3" />
      <circle cx="50" cy="130" r="17" />
      <circle cx="152" cy="130" r="17" />
      <circle cx="50" cy="130" r="7" />
      <circle cx="152" cy="130" r="7" />
      <path d="M12 142 h178" strokeWidth="1" strokeDasharray="3 4" />
    </>
  );
};

const watch: Drawing = (a, v) => (
  <>
    <path d="M78 20 h44 l-4 36 h-36 z M82 180 h36 l4 -36 h-44 z" />
    <circle cx="100" cy="100" r="48" />
    {v === "bezel" && (
      <>
        <circle cx="100" cy="100" r="44" stroke={a} strokeWidth="5" />
        <path d="M100 52 l-4 -6 h8 z" fill={a} stroke="none" />
      </>
    )}
    <circle cx="100" cy="100" r={v === "bezel" ? 38 : 42} fill="#000" fillOpacity="0.5" />
    {range(12).map((i) => (
      <path
        key={i}
        d={`M100 ${v === "bezel" ? 64 : 60} v${i % 3 === 0 ? 8 : 4}`}
        transform={`rotate(${i * 30} 100 100)`}
        strokeWidth={i % 3 === 0 ? 2.5 : 1.5}
      />
    ))}
    <path d="M100 100 L100 74" strokeWidth="3" />
    <path d="M100 100 L120 108" strokeWidth="3" />
    <path d="M100 108 L100 66" stroke={a} strokeWidth="1.2" />
    <circle cx="100" cy="100" r="2.5" fill={a} stroke="none" />
    <rect x="148" y="94" width="6" height="12" rx="1" />
  </>
);

export const drawings: Record<string, Drawing> = {
  cpu,
  mainboard,
  memory,
  gpu,
  storage,
  psu,
  case: pcCase,
  cooler,
  keyboard,
  laptop,
  dap,
  earphone,
  headphone,
  console: consoleDrawing,
  bicycle,
  motorcycle,
  car,
  watch,
};
