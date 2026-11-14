import type { ReactNode } from "react";
import { Shadow, Wheel } from "./parts";

/* 탈것은 모두 오른쪽을 보는 옆모습. 엠블럼과 로고는 그리지 않는다. */

/** 스트라이다: 삼각 프레임, 16인치 바퀴, 벨트 구동 */
function strida(): ReactNode {
  const spokeWheel = (cx: number) => (
    <g>
      <circle cx={cx} cy={142} r={30} fill="none" stroke="#1a1a1c" strokeWidth={5} />
      <circle cx={cx} cy={142} r={27} fill="none" stroke="#9a9ea5" strokeWidth={1.4} />
      {[0, 120, 240].map((a) => (
        <rect key={a} x={cx - 2} y={116} width={4} height={26} rx={2} fill="#2a2a2d" transform={`rotate(${a} ${cx} 142)`} />
      ))}
      <circle cx={cx} cy={142} r={5} fill="#2a2a2d" />
    </g>
  );
  return (
    <g>
      <Shadow cx={100} cy={174} rx={78} ry={4} />
      {spokeWheel(50)}
      {spokeWheel(150)}
      {/* 삼각 프레임 */}
      <path d="M50 142 L104 26" stroke="#f08a24" strokeWidth={7} strokeLinecap="round" />
      <path d="M150 142 L104 26" stroke="#f08a24" strokeWidth={7} strokeLinecap="round" />
      <path d="M50 142 L150 142" stroke="#e07a14" strokeWidth={6} strokeLinecap="round" />
      <path d="M52 138 L104 30" stroke="#ffffff" strokeWidth={1.5} opacity={0.3} />
      {/* 벨트 커버와 크랭크 */}
      <rect x={60} y={137} width={60} height={10} rx={5} fill="#2a2a2d" />
      <circle cx={112} cy={142} r={9} fill="#2a2a2d" />
      <path d="M112 142 L122 156" stroke="#2a2a2d" strokeWidth={4} strokeLinecap="round" />
      <rect x={118} y={155} width={12} height={4} rx={1} fill="#1a1a1c" />
      {/* 안장 */}
      <path d="M118 66 L148 60 L150 66 L120 72 Z" fill="#1a1a1c" />
      <path d="M134 68 L128 84" stroke="#9a9ea5" strokeWidth={3} />
      {/* 핸들바 (접히는 T자) */}
      <path d="M104 26 L92 22" stroke="#2a2a2d" strokeWidth={4} strokeLinecap="round" />
      <path d="M84 16 L100 28" stroke="#1a1a1c" strokeWidth={5} strokeLinecap="round" />
      {/* 짐받이 겸 받침 */}
      <path d="M150 142 L168 120" stroke="#9a9ea5" strokeWidth={2.5} />
    </g>
  );
}

/** 파니갈레 V4 S: 빨간 풀 페어링, 윙렛, 편측 스윙암 */
function panigale(): ReactNode {
  return (
    <g>
      <Shadow cx={100} cy={176} rx={86} ry={4} />
      {/* 편측 스윙암과 포크 */}
      <path d="M46 146 L104 120" stroke="#6b6e74" strokeWidth={8} strokeLinecap="round" />
      <path d="M156 146 L148 76" stroke="#c9a227" strokeWidth={6} />
      <path d="M156 146 L151 104" stroke="#9aa0a6" strokeWidth={3.5} />
      <Wheel cx={46} cy={146} r={27} rim="#1a1a1c" spokes={3} spokeColor="#2b2b2f" hub="#9aa0a6" />
      <Wheel cx={156} cy={146} r={27} rim="#1a1a1c" spokes={3} spokeColor="#2b2b2f" hub="#9aa0a6" caliper="#c9a227" />
      {/* 엔진과 프레임 */}
      <path d="M88 92 L136 88 L138 128 L96 132 Z" fill="#2b2b2f" />
      <path d="M98 100 L126 98 L126 124 L100 126 Z" fill="#45474d" />
      {/* 아래 배기 */}
      <path d="M92 132 L124 126 L122 136 L94 140 Z" fill="#7a7d83" />
      {/* 꼬리와 시트 */}
      <path d="M26 58 L62 62 L102 70 L98 86 L60 84 L36 72 Z" fill="#cf1f2e" />
      <path d="M62 62 L102 70 L100 76 L64 70 Z" fill="#1a1a1c" />
      <path d="M28 60 L36 62" stroke="#ff6b6b" strokeWidth={2.5} strokeLinecap="round" />
      {/* 연료 탱크 */}
      <path d="M98 70 C 110 58, 136 54, 152 62 L142 82 L100 82 Z" fill="#b5182a" />
      <path d="M104 68 C 114 60, 132 58, 144 62 L136 66 C 126 64, 114 66, 104 72 Z" fill="#ffffff" opacity={0.22} />
      {/* 앞 페어링 */}
      <path d="M130 80 L150 62 C 164 60, 180 74, 190 98 L186 108 C 174 118, 152 126, 132 126 L124 104 Z" fill="#cf1f2e" />
      <path d="M150 62 C 164 60, 180 74, 188 94 L170 90 C 162 78, 154 72, 146 70 Z" fill="#ffffff" opacity={0.2} />
      {/* 옆 공기 배출구 */}
      <path d="M134 98 L156 96 L150 110 L136 112 Z" fill="#1a1a1c" />
      {/* 윙렛 */}
      <path d="M156 86 L176 84 L174 92 L156 94 Z" fill="#8f0f1a" />
      {/* 윈드스크린과 헤드램프 */}
      <path d="M150 62 C 156 50, 170 50, 178 64 L168 70 Z" fill="#2a3640" opacity={0.9} />
      <path d="M176 80 L190 96" stroke="#f1f5ff" strokeWidth={2.5} strokeLinecap="round" />
      {/* 흰 줄 */}
      <path d="M128 116 L182 104" stroke="#f2f2f2" strokeWidth={2} />
    </g>
  );
}

/** 대형 세단: 긴 후드, 쿠페 같은 지붕선, 두 줄 램프 */
function g80(): ReactNode {
  return (
    <g>
      <Shadow cx={100} cy={160} rx={96} ry={5} />
      {/* 차체 */}
      <path
        d="M6 128 C 6 112, 14 104, 34 100 L66 96 C 80 80, 96 70, 120 70 C 142 70, 156 82, 168 96 L186 100 C 196 104, 198 116, 196 128 L194 138 L8 138 Z"
        fill="#5e6874"
      />
      <path d="M34 100 L66 96 C 80 80, 96 70, 120 70 C 142 70, 156 82, 168 96 L186 100 L186 104 L32 106 Z" fill="#ffffff" opacity={0.12} />
      {/* 유리 */}
      <path d="M72 96 C 84 82, 98 76, 116 76 L118 96 Z" fill="#1d252e" />
      <path d="M122 76 C 140 76, 152 84, 162 96 L122 96 Z" fill="#1d252e" />
      <path d="M74 94 C 84 84, 94 80, 104 78 L84 94 Z" fill="#ffffff" opacity={0.15} />
      <rect x={118} y={76} width={4} height={20} fill="#3e464f" />
      {/* 크롬 창틀 */}
      <path d="M70 97 C 84 80, 98 74, 120 74 C 140 74, 154 84, 164 97" fill="none" stroke="#c9cdd2" strokeWidth={1.4} />
      {/* 캐릭터 라인과 문 */}
      <path d="M20 112 L190 108" stroke="#ffffff" strokeOpacity={0.25} strokeWidth={1.2} />
      <path d="M118 98 L118 134 M74 100 L72 134" stroke="#3e464f" strokeWidth={1} />
      <rect x={92} y={108} width={10} height={2} rx={1} fill="#c9cdd2" />
      <rect x={136} y={106} width={10} height={2} rx={1} fill="#c9cdd2" />
      {/* 두 줄 램프 */}
      <path d="M184 104 L196 108 M184 110 L196 114" stroke="#f1f5ff" strokeWidth={2} strokeLinecap="round" />
      <path d="M8 108 L22 104 M8 114 L22 110" stroke="#e23b3b" strokeWidth={2} strokeLinecap="round" />
      {/* 아래 그늘 */}
      <path d="M8 130 L194 130 L194 138 L8 138 Z" fill="#000" opacity={0.25} />
      <Wheel cx={46} cy={136} r={20} rim="#4b4f55" spokes={10} spokeColor="#c9cdd2" />
      <Wheel cx={158} cy={136} r={20} rim="#4b4f55" spokes={10} spokeColor="#c9cdd2" />
    </g>
  );
}

/** 아벤타도르: 노란 쐐기형, 낮은 지붕, 옆 공기 흡입구 */
function aventador(): ReactNode {
  return (
    <g>
      <Shadow cx={100} cy={160} rx={96} ry={5} />
      <path d="M4 124 L8 108 L40 100 L72 84 C 90 76, 112 76, 128 82 L196 112 L198 126 L194 138 L6 138 Z" fill="#f2c230" />
      <path d="M40 100 L72 84 C 90 76, 112 76, 128 82 L196 112 L194 116 L40 104 Z" fill="#ffffff" opacity={0.2} />
      {/* 유리: 앞 유리가 길게 누운 모양 */}
      <path d="M76 88 C 92 80, 110 80, 124 86 L168 104 L80 100 Z" fill="#1a1d22" />
      <path d="M84 96 L118 84 L124 86 L92 98 Z" fill="#ffffff" opacity={0.14} />
      {/* 옆 흡입구 */}
      <path d="M50 108 L86 104 L76 124 L54 124 Z" fill="#1a1a1c" />
      <path d="M38 102 L54 98 L50 106 L38 108 Z" fill="#1a1a1c" />
      {/* 날카로운 캐릭터 라인 */}
      <path d="M10 118 L60 108 M90 112 L196 118" stroke="#b58d12" strokeWidth={1.4} />
      {/* 아래 카본 사이드 스커트 */}
      <path d="M30 134 L170 134 L168 140 L32 140 Z" fill="#1a1a1c" />
      {/* 램프 */}
      <path d="M186 114 L198 120" stroke="#f1f5ff" strokeWidth={2.5} strokeLinecap="round" />
      <path d="M4 112 L14 108" stroke="#e23b3b" strokeWidth={3} strokeLinecap="round" />
      <Wheel cx={44} cy={136} r={21} rim="#1a1a1c" spokes={5} spokeColor="#8a8d94" caliper="#f2c230" />
      <Wheel cx={160} cy={136} r={20} rim="#1a1a1c" spokes={5} spokeColor="#8a8d94" caliper="#f2c230" />
    </g>
  );
}

export const vehicleModels: Record<string, () => ReactNode> = {
  "strida-lt": strida,
  "ducati-panigale-v4-s": panigale,
  "genesis-g80": g80,
  "lamborghini-aventador": aventador,
};
