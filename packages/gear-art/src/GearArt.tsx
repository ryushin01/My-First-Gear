import type { ImgHTMLAttributes } from "react";

/** 상품 그림 파일 경로. 쇼핑몰이 빌드할 때 상품마다 /art/<slug>.svg를 미리 만든다(apps/shop/app/art/[file]/route.ts). */
export const artFileUrl = (slug: string) => `/art/${encodeURIComponent(slug)}.svg`;

type GearArtProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt" | "children"> & {
  /** 상품 slug */
  slug: string;
  /** 그림 설명. 없으면 장식 그림(alt="")이라 보조기기가 건너뛴다. */
  label?: string;
  /** 첫 화면의 큰 그림이면 미루지 않고 바로 받는다. */
  priority?: boolean;
};

/**
 * 상품 그림. 빌드할 때 상품마다 SVG 파일을 미리 만들어 두고 브라우저는 이미지로 받는다.
 * 그래서 그림 코드(실사풍 그림, 종류별 선 그림)는 브라우저 번들에 들어가지 않는다. 로고·상표 문양은 그리지 않는다.
 */
export function GearArt({ slug, label, priority = false, width = 200, height = 200, style, ...props }: GearArtProps) {
  return (
    <img
      src={artFileUrl(slug)}
      alt={label ?? ""}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      style={{ objectFit: "contain", ...style }}
      {...props}
    />
  );
}
