import type { SVGProps } from "react";
import { drawings } from "./drawings";
import { models } from "./models";

/** model: 상품별 실사풍 그림 키(상품 slug). 없으면 kind의 선 그림을 쓴다. */
export type GearArtValue = { kind: string; accent: string; variant?: string; model?: string };

type GearArtProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  art: GearArtValue;
  /** 그림 설명. 없으면 장식으로 보고 보조기기에서 숨긴다. */
  label?: string;
};

/**
 * 상품 그림. 실사풍 그림(model)이 있으면 실제 제품 색과 모양으로 그리고,
 * 없으면 종류별 선 그림을 currentColor로 그린다. 로고·상표 문양은 그리지 않는다.
 */
export function GearArt({ art, label, ...props }: GearArtProps) {
  const model = art.model ? models[art.model] : undefined;
  const draw = drawings[art.kind];
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true };

  return (
    <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...a11y} {...props}>
      {model ? <g stroke="none">{model()}</g> : draw ? draw(art.accent, art.variant) : <rect x="40" y="40" width="120" height="120" rx="8" />}
    </svg>
  );
}
