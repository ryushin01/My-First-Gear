import type { SVGProps } from "react";
import { drawings } from "./drawings";
import { models } from "./models";
import type { GearArtValue } from "./types";

type GearArtSvgProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  art: GearArtValue;
  /** 그림 설명. 없으면 장식으로 보고 보조기기에서 숨긴다. */
  label?: string;
};

/**
 * 상품 그림을 SVG로 바로 그린다(서버 전용: 공유 이미지, 정적 그림 파일).
 * 실사풍 그림(model)이 있으면 실제 제품 색과 모양으로, 없으면 종류별 선 그림을 currentColor로 그린다.
 * 그림 코드는 크므로 브라우저 번들에 넣지 않는다. 브라우저는 GearArt로 미리 만든 그림 파일을 받는다.
 */
export function GearArtSvg({ art, label, ...props }: GearArtSvgProps) {
  // 표에서 자기 속성만 읽는다("constructor" 같은 물려받은 이름에 걸리지 않게).
  const model = art.model && Object.hasOwn(models, art.model) ? models[art.model] : undefined;
  const draw = Object.hasOwn(drawings, art.kind) ? drawings[art.kind] : undefined;
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true };

  return (
    <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...a11y} {...props}>
      {model ? <g stroke="none">{model()}</g> : draw ? draw(art.accent, art.variant) : <rect x="40" y="40" width="120" height="120" rx="8" />}
    </svg>
  );
}
