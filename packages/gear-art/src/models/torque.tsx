import type { ReactNode } from "react";
import { range } from "./parts";

/*
 * 안텍 토크 화이트(Antec TORQUE Black/White)를 왼쪽 강화유리 쪽에서 본 모습. 좌표는 400×440이다.
 * 실제 케이스처럼 흰 알루미늄 판은 바깥(앞으로 기운 위 판, 아래로 좁아지는 앞 판)에만 있고,
 * 속은 삼각 구멍이 뚫린 검은 뼈대, 아래는 파워 받침과 벌어진 다리다. 옆은 모서리를 깎은 짙은 강화유리를
 * 네 귀퉁이 나사로 띄워 단다.
 * 부품을 사이에 끼울 수 있게 뒤(TorqueBack)와 앞(TorqueFront)을 나눈다. 로고와 상표 문양은 그리지 않는다.
 */

const WHITE = "#f3f3f0";
const WHITE_SHADE = "#d3d4d0";
const FRAME = "#131417";
const FRAME_EDGE = "#2c2e33";

/** 부품 뒤에 오는 부분: 그림자, 보드 트레이 뼈대, 뒤 기둥과 확장 슬롯, 파워 받침, 다리 */
export function TorqueBack(): ReactNode {
  return (
    <g>
      <ellipse cx={212} cy={433} rx={178} ry={6} fill="#000" opacity={0.45} />

      {/* 보드 트레이 뼈대: 보드와 앞 판 사이로 삼각 구멍이 보인다 */}
      <path
        fillRule="evenodd"
        fill={FRAME}
        d="M98 60 L318 70 L326 98 L326 364 L98 364 Z
           M288 104 L312 116 L288 150 Z M312 128 L312 176 L290 164 Z
           M288 182 L312 196 L288 232 Z M312 206 L312 252 L292 240 Z"
      />
      <path d="M318 70 L326 98 L326 364" fill="none" stroke={FRAME_EDGE} strokeWidth={1.5} />

      {/* 뒤 기둥: I/O 구멍과 확장 슬롯 덮개 7개 */}
      <path
        fillRule="evenodd"
        fill={FRAME}
        d="M62 56 L98 60 L98 424 L74 428 L60 400 L58 96 Z
           M70 194 L92 194 L92 208 Z M66 364 L92 372 L66 396 Z M92 380 L92 416 L76 410 Z"
      />
      <path d="M62 60 L60 396" fill="none" stroke={FRAME_EDGE} strokeWidth={1.5} />
      <rect x={68} y={104} width={24} height={84} rx={1.5} fill="#060607" />
      {range(7).map((i) => (
        <g key={i}>
          <rect x={66} y={214 + i * 21} width={26} height={16} rx={1} fill="#1d1e22" />
          {range(3).map((j) => (
            <rect key={j} x={70 + j * 7} y={218 + i * 21} width={4} height={8} rx={1} fill="#0a0a0b" />
          ))}
        </g>
      ))}

      {/* 파워 받침: 파워 양옆으로 삼각 구멍이 난 검은 틀 */}
      <path
        fillRule="evenodd"
        fill={FRAME}
        d="M98 364 L318 364 L318 424 L98 424 Z
           M104 372 L146 372 L104 416 Z M146 380 L146 418 L112 418 Z
           M280 372 L312 372 L312 404 Z M280 384 L306 418 L280 418 Z"
      />
      <path d="M98 364 H318" fill="none" stroke={FRAME_EDGE} strokeWidth={1.5} />

      {/* 벌어진 다리와 바닥 판, 앞쪽 아래를 감싸는 흰 판 */}
      <rect x={112} y={424} width={180} height={5} fill="#0e0f11" />
      <path d="M74 424 L112 424 L70 436 L34 436 Z" fill={FRAME} />
      <path d="M292 424 L330 418 L392 434 L358 436 Z" fill={FRAME} />
      <rect x={30} y={434} width={44} height={3} rx={1} fill="#0a0a0b" />
      <rect x={356} y={434} width={40} height={3} rx={1} fill="#0a0a0b" />
      <path d="M268 424 L330 414 L352 424 L296 432 Z" fill={WHITE} />
      <path d="M296 432 L352 424 L352 428 L300 436 Z" fill={WHITE_SHADE} />
    </g>
  );
}

/** 부품 앞에 오는 부분: 아래로 좁아지는 앞 판, 앞으로 기운 위 판과 포트, 강화유리와 나사 */
export function TorqueFront(): ReactNode {
  return (
    <g>
      {/* 앞 판: 두 장이 V자로 접혀 아래로 좁아진다 */}
      <path d="M326 70 L372 86 L392 230 L376 352 L348 420 L330 412 L322 236 Z" fill={WHITE} />
      <path d="M326 70 L342 76 L336 236 L340 410 L330 412 L322 236 Z" fill={WHITE_SHADE} />
      <path d="M342 76 L336 236 L340 410" fill="none" stroke="#000" strokeWidth={1} opacity={0.15} />
      <path d="M372 86 L392 230 L376 352 L348 420" fill="none" stroke="#ffffff" strokeWidth={1.2} opacity={0.85} />
      <path d="M322 234 L392 228" fill="none" stroke={FRAME} strokeWidth={3} />
      <rect x={352} y={224} width={12} height={10} fill={FRAME} />
      <path d="M352 296 L374 330" fill="none" stroke={FRAME} strokeWidth={3} strokeLinecap="round" />

      {/* 위 판: 뒤가 들린 쐐기 모양, 가운데 통풍구와 나사, 앞쪽 끝의 포트 */}
      <path d="M44 22 L84 32 L304 46 L354 64 L378 88 L360 96 L306 62 L86 52 L58 56 Z" fill={WHITE} />
      <path d="M86 46 L306 56 L360 90 L360 96 L306 62 L86 52 Z" fill={WHITE_SHADE} />
      <path d="M44 22 L58 56 L72 54 Z" fill={FRAME} />
      <path d="M44 22 L84 32 L304 46 L354 64 L378 88" fill="none" stroke="#ffffff" strokeWidth={1.2} opacity={0.9} />
      <path d="M150 38 L252 45 L252 50 L150 43 Z" fill={FRAME} />
      {range(8).map((i) => (
        <path key={i} d={`M${160 + i * 12} ${39 + i * 0.8} v5`} fill="none" stroke="#5b5e64" strokeWidth={1} />
      ))}
      {[
        [124, 40],
        [276, 50],
      ].map(([cx, cy]) => (
        <g key={cx}>
          <circle cx={cx} cy={cy} r={4} fill={FRAME} />
          <circle cx={cx} cy={cy} r={1.6} fill="#55585e" />
        </g>
      ))}
      <rect x={316} y={53} width={7} height={3} fill="#18191c" transform="rotate(18 319 54)" />
      <rect x={326} y={56} width={7} height={3} fill="#18191c" transform="rotate(18 329 57)" />
      <circle cx={338} cy={61} r={2.4} fill="#18191c" />
      <circle cx={338} cy={61} r={1} fill="#8a8d93" />
      <circle cx={346} cy={64} r={1.4} fill="#18191c" />
      <circle cx={352} cy={67} r={1.4} fill="#18191c" />
      <rect x={357} y={69} width={5} height={2} rx={1} fill="#18191c" transform="rotate(30 359 70)" />

      {/* 모서리를 깎은 짙은 강화유리와 네 귀퉁이 나사 */}
      <path
        d="M114 96 L262 100 L306 132 L310 300 L286 362 L118 366 L92 330 L90 124 Z"
        fill="#1b2431"
        fillOpacity={0.22}
        stroke="#a9b8c8"
        strokeOpacity={0.55}
        strokeWidth={1.4}
      />
      <path d="M132 100 L170 101 L110 300 L94 300 L94 190 Z" fill="#ffffff" opacity={0.06} />
      <path d="M262 104 L300 136 L210 362 L190 362 Z" fill="#ffffff" opacity={0.035} />
      {[
        [104, 112],
        [294, 122],
        [298, 344],
        [108, 350],
      ].map(([cx, cy]) => (
        <g key={`${cx}-${cy}`}>
          <circle cx={cx} cy={cy} r={6.5} fill="#0e0f11" />
          <circle cx={cx} cy={cy} r={6.5} fill="none" stroke="#3d4046" strokeWidth={1} />
          <circle cx={cx} cy={cy} r={2.4} fill="#2e3035" />
        </g>
      ))}
    </g>
  );
}

/** 상품 카드용: 케이스 안에 흰 판 버전 홍보 사진처럼 푸른 빛의 조립 PC를 간단히 넣는다 */
export function antecTorque(): ReactNode {
  return (
    <g transform="translate(8 0) scale(0.455)">
      <TorqueBack />
      <ellipse cx={205} cy={220} rx={100} ry={130} fill="#3d8bff" opacity={0.08} />
      {/* 메인보드와 방열판 */}
      <rect x={100} y={100} width={182} height={200} rx={2} fill="#101114" />
      <rect x={100} y={100} width={42} height={96} fill="#2e3035" />
      <rect x={142} y={102} width={72} height={18} fill="#1b1c20" />
      <rect x={104} y={220} width={176} height={76} fill="#2a2c31" />
      {range(4).map((i) => (
        <rect key={i} x={221 + i * 10} y={118} width={6} height={90} rx={1} fill="#7fc4ff" opacity={0.85} />
      ))}
      {/* 위 라디에이터와 아래를 보는 팬 셋 */}
      <rect x={62} y={62} width={254} height={14} fill="#121316" />
      {[123, 200, 277].map((cx) => (
        <g key={cx}>
          <ellipse cx={cx} cy={86} rx={36} ry={8} fill="#16171a" />
          <ellipse cx={cx} cy={86} rx={34} ry={7} fill="none" stroke="#4ab0ff" strokeWidth={2} />
        </g>
      ))}
      {/* 펌프 */}
      <circle cx={178} cy={148} r={24} fill="#17181b" />
      <circle cx={178} cy={148} r={18} fill="#0b1424" />
      <circle cx={178} cy={148} r={14} fill="none" stroke="#4ab0ff" strokeWidth={3} />
      {/* 가로로 꽂은 그래픽카드의 윗면과 빛 띠 */}
      <rect x={104} y={238} width={196} height={26} rx={3} fill="#2a2c31" />
      <rect x={104} y={238} width={196} height={3} fill="#b8bdc4" />
      <rect x={120} y={256} width={164} height={2} fill="#4ab0ff" />
      {/* 파워 */}
      <rect x={150} y={366} width={124} height={54} rx={2} fill="#141518" />
      <rect x={150} y={366} width={124} height={4} fill="#26282c" />
      <TorqueFront />
    </g>
  );
}
