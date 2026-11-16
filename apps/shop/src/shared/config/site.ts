/** 사이트 주소. Vercel 운영 배포는 VERCEL_PROJECT_PRODUCTION_URL을 자동으로 넣어 준다. */
export const SITE_URL = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
);

export const SITE_NAME = "My First Gear";

/** 없는 주소·상품·카테고리 화면의 제목 */
export const NOT_FOUND_TITLE = "신호를 찾지 못했습니다";
export const SITE_DESCRIPTION = "컴퓨터 부품부터 오디오, 탈것, 시계까지 첫 장비를 고르는 기어 숍 (포트폴리오 데모)";
