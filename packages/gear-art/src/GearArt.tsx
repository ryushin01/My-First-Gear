import type { SVGProps } from "react";
import { drawings } from "./drawings";

export type GearArtValue = { kind: string; accent: string; variant?: string };

type GearArtProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  art: GearArtValue;
  /** 그림 설명. 없으면 장식으로 보고 보조기기에서 숨긴다. */
  label?: string;
};

/** 상품 그림. 선 색은 currentColor를 따른다. */
export function GearArt({ art, label, ...props }: GearArtProps) {
  const draw = drawings[art.kind];
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true };

  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...a11y}
      {...props}
    >
      {draw ? draw(art.accent, art.variant) : <rect x="40" y="40" width="120" height="120" rx="8" />}
    </svg>
  );
}
