import type { GearArtValue } from "@mfg/gear-art";
import { GearArtSvg } from "@mfg/gear-art/server";
import { toSvgString } from "./svgString";

/** 화면 글자색. 이미지로 쓰는 그림은 페이지 글자색을 물려받지 못하므로 선 색(currentColor)을 이 색으로 칠한다. */
const LINE_COLOR = "#f5f5f2";

/**
 * 상품 그림 한 장을 SVG 문서 문자열로 만든다(정적 그림 파일, 공유 이미지).
 * 그림 코드 전체를 싣는 서버 전용 함수다. 브라우저 컴포넌트에서 부르지 않는다.
 */
export function artSvg(art: GearArtValue): string {
  return toSvgString(<GearArtSvg art={art} width={200} height={200} xmlns="http://www.w3.org/2000/svg" />).replaceAll("currentColor", LINE_COLOR);
}
