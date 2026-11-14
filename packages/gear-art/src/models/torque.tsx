import type { ReactNode } from "react";
import { range } from "./parts";

/*
 * 안텍 토크 화이트(Antec TORQUE Black/White)를 왼쪽 강화유리 쪽에서 본 모습. 좌표는 400×440이다.
 * 옆모습을 찍은 사진의 윤곽을 실제 비율(높이 644mm, 깊이 621mm)로 옮겼다.
 * - 위 판: 뒤 꼭대기에서 앞으로 가파르게(약 27°) 내려가 앞으로 튀어나온다.
 * - 앞: 위 판 끝의 짧은 코 판, 그 아래로 날처럼 좁아지며 뒤로 들어가는 앞 판.
 * - 옆: 위 판 아래에서 앞쪽을 따라 내려오다 바닥에서 뒤로 날개를 뻗는 흰 J자 판.
 * - 속: 삼각·다각형 구멍이 뚫린 검은 뼈대. 메인보드 트레이가 앞으로 약 18° 기울어 있어 뒤 확장 슬롯이 비스듬히 튀어나온다.
 * 부품을 사이에 끼울 수 있게 뒤(TorqueBack)와 앞(TorqueFront)을 나눈다. 로고와 상표 문양은 그리지 않는다.
 */

const WHITE = "#f3f3f0";
const WHITE_SHADE = "#d6d7d3";
const FRAME = "#17181c";
const FRAME_EDGE = "#34373d";

/** 메인보드 트레이의 기울기와 배치. 조립 장면의 부품도 이 값으로 케이스 안에 놓는다. */
export const TORQUE_TRAY = "translate(130 262) rotate(18) scale(0.8) translate(-189 -241)";
/** 위 판 아래에 위 판과 나란히 다는 360mm 라디에이터의 배치 (부품 좌표의 뒤 끝 62,62 기준) */
export const TORQUE_TOP_RADIATOR = "translate(97 57) rotate(28.86) scale(0.8) translate(-62 -62)";

/** 부품 뒤에 오는 부분: 그림자, 검은 뼈대와 구멍, 비스듬히 튀어나온 확장 슬롯, 바닥 다리 */
export function TorqueBack(): ReactNode {
  return (
    <g>
      <ellipse cx={200} cy={433} rx={190} ry={6} fill="#000" opacity={0.45} />

      {/* 검은 뼈대: 위 판 아래에서 앞 판 뒤를 지나 바닥과 뒤쪽까지. 보이는 자리마다 다각형 구멍 */}
      <path
        fillRule="evenodd"
        fill={FRAME}
        stroke={FRAME_EDGE}
        strokeWidth={1.2}
        d="M99 54 L336 178 L348 226 L330 282 L300 352 L270 405 L262 424 L230 432 L60 434 L16 429 L6 354 L6 290 L40 280 L50 190 L55 171 L63 114 Z
           M70 92 L96 84 L104 118 L76 128 Z
           M64 150 L88 140 L84 176 Z
           M250 196 L300 214 L262 246 Z
           M258 262 L300 262 L288 300 Z
           M14 300 L40 292 L34 336 L14 344 Z
           M24 368 L52 392 L22 412 Z
           M196 396 L250 384 L232 414 Z"
      />
      {/* 바닥 받침을 잇는 볼트 */}
      {[
        [22, 412],
        [58, 404],
        [16, 330],
        [120, 418],
        [196, 420],
      ].map(([cx, cy]) => (
        <g key={`${cx}-${cy}`}>
          <circle cx={cx} cy={cy} r={4.2} fill="#0d0e10" />
          <circle cx={cx} cy={cy} r={4.2} fill="none" stroke={FRAME_EDGE} strokeWidth={1} />
        </g>
      ))}

      {/* 기운 트레이를 따라 뒤로 튀어나온 확장 슬롯 7개 */}
      <path d="M36 186 L60 186 L34 270 L10 270 Z" fill={FRAME} />
      {range(7).map((i) => {
        const t = (i + 0.5) / 7;
        const x = 34 - t * 26;
        const y = 188 + t * 80;
        return <rect key={i} x={x} y={y - 4} width={22} height={7} rx={1} fill="#25272b" transform={`rotate(18 ${x + 11} ${y})`} />;
      })}

      {/* 바닥 다리: 뒤쪽은 넓게, 앞쪽은 앞 판 아래로 */}
      <path d="M10 424 L64 428 L58 436 L4 434 Z" fill={FRAME} />
      <path d="M214 426 L290 420 L300 434 L226 437 Z" fill={FRAME} />
      <rect x={4} y={434} width={54} height={3} rx={1} fill="#0a0a0b" />
      <rect x={228} y={434} width={70} height={3} rx={1} fill="#0a0a0b" />
    </g>
  );
}

/** 부품 앞에 오는 부분: 짙은 강화유리, 흰 J자 옆 판, 위 판, 코 판, 앞 판 */
export function TorqueFront(): ReactNode {
  return (
    <g>
      {/* 짙은 강화유리: 위 판 아래에서 J자 판 안쪽까지, 귀퉁이 나사로 띄워 단다 */}
      <path
        d="M62 74 L196 134 L214 171 L226 240 L232 300 L220 352 L120 356 L44 330 L40 270 L52 190 L58 110 Z"
        fill="#1b2431"
        fillOpacity={0.22}
        stroke="#a9b8c8"
        strokeOpacity={0.5}
        strokeWidth={1.3}
      />
      <path d="M84 86 L120 102 L60 300 L46 290 L52 190 Z" fill="#ffffff" opacity={0.05} />
      {[
        [70, 88],
        [206, 152],
        [222, 338],
        [52, 318],
      ].map(([cx, cy]) => (
        <g key={`${cx}-${cy}`}>
          <circle cx={cx} cy={cy} r={6} fill="#0e0f11" />
          <circle cx={cx} cy={cy} r={6} fill="none" stroke="#3d4046" strokeWidth={1} />
          <circle cx={cx} cy={cy} r={2.2} fill="#2e3035" />
        </g>
      ))}

      {/* 흰 옆 판: 위 판 아래로 비스듬히 내려가는 팔, 앞쪽을 따라 내려오는 띠, 바닥에서 뒤로 뻗는 날개.
          안쪽은 검은 창으로 비어 있다 */}
      <path
        d="M204 137 L240 155 L320 200 L336 213 L342 230 L335 255 L325 280 L313 305 L300 330 L285 354 L273 379 L262 404 L256 421
           L220 410 L149 389 L94 375 L83 361 L149 357 L215 354 L220 330 L234 310 L259 310 L300 233 L215 171 L205 144 Z"
        fill={WHITE}
      />
      <path d="M94 375 L83 361 L149 357 L215 354 L220 330 L234 310 L230 352 L220 410 L149 389 Z" fill={WHITE_SHADE} opacity={0.6} />
      <path d="M215 171 L300 233 L259 310 L234 310" fill="none" stroke="#000" strokeWidth={1} opacity={0.2} />
      {[
        [217, 154],
        [299, 195],
        [244, 326],
      ].map(([cx, cy]) => (
        <g key={`${cx}-${cy}`}>
          <circle cx={cx} cy={cy} r={4.5} fill={FRAME} />
          <circle cx={cx} cy={cy} r={1.8} fill="#55585e" />
        </g>
      ))}

      {/* 위 판: 뒤 꼭대기에서 앞으로 가파르게 내려가 튀어나온다. 긴 통풍구 두 개와 나사 */}
      <path d="M58 22 L372 156 L322 178 L102 57 Z" fill={WHITE} />
      <path d="M102 51 L324 172 L322 178 L102 57 Z" fill={WHITE_SHADE} />
      <path d="M58 22 L372 156" fill="none" stroke="#ffffff" strokeWidth={1.2} opacity={0.9} />
      <path d="M150 69.8 L172 79.9 L172 84.9 L150 74.8 Z" fill={FRAME} />
      <path d="M205 95.3 L296 137.3 L296 142.3 L205 100.3 Z" fill={FRAME} />
      {[
        [124, 60],
        [333, 144],
      ].map(([cx, cy]) => (
        <g key={cx}>
          <circle cx={cx} cy={cy} r={4.5} fill={FRAME} />
          <circle cx={cx} cy={cy} r={1.8} fill="#55585e" />
        </g>
      ))}

      {/* 코 판: 위 판 끝 아래, 앞쪽 위 포트가 있는 짧은 판 */}
      <path d="M321 198 L381 168 L387 182 L372 218 L342 225 Z" fill={WHITE} />
      <path d="M321 198 L381 168 L384 175 L328 203 Z" fill="#ffffff" />
      {[
        [340, 191],
        [349, 187],
        [358, 182.5],
        [366, 178.5],
      ].map(([cx, cy]) => (
        <circle key={cx} cx={cx} cy={cy} r={1.6} fill="#18191c" />
      ))}

      {/* 앞 판: 날처럼 아래로 좁아지며 뒤로 들어간다. 왼쪽 면은 비스듬해 조금 어둡다 */}
      <path d="M350 225 L394 181 L380 245 L358 305 L331 354 L292 404 L259 421 L266 404 L290 354 L317 305 L330 280 L339 255 L346 230 Z" fill={WHITE} />
      <path d="M350 225 L394 181 L259 421 L266 404 L290 354 L317 305 L330 280 L339 255 L346 230 Z" fill={WHITE_SHADE} />
      <path d="M394 181 L380 245 L358 305 L331 354 L292 404 L259 421" fill="none" stroke="#ffffff" strokeWidth={1.2} opacity={0.85} />
    </g>
  );
}

/** 상품 카드용: 기운 트레이에 흰 판 버전 홍보 사진처럼 푸른 빛의 조립 PC를 간단히 넣는다 */
export function antecTorque(): ReactNode {
  return (
    <g transform="translate(10 0) scale(0.452)">
      <TorqueBack />
      <ellipse cx={150} cy={230} rx={100} ry={120} fill="#3d8bff" opacity={0.08} />
      <g transform={TORQUE_TOP_RADIATOR}>
        <rect x={62} y={62} width={254} height={14} fill="#121316" />
        {[123, 200, 277].map((cx) => (
          <g key={cx}>
            <ellipse cx={cx} cy={86} rx={36} ry={8} fill="#16171a" />
            <ellipse cx={cx} cy={86} rx={34} ry={7} fill="none" stroke="#4ab0ff" strokeWidth={2} />
          </g>
        ))}
      </g>
      <g transform={TORQUE_TRAY}>
        {/* 메인보드와 방열판 */}
        <rect x={100} y={100} width={182} height={200} rx={2} fill="#101114" />
        <rect x={100} y={100} width={42} height={96} fill="#2e3035" />
        <rect x={142} y={102} width={72} height={18} fill="#1b1c20" />
        <rect x={104} y={220} width={176} height={76} fill="#2a2c31" />
        {range(4).map((i) => (
          <rect key={i} x={221 + i * 10} y={118} width={6} height={90} rx={1} fill="#7fc4ff" opacity={0.85} />
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
      </g>
      <TorqueFront />
    </g>
  );
}
