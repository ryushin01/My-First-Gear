/** 사이트 주소. Vercel 운영 배포는 VERCEL_PROJECT_PRODUCTION_URL을 자동으로 넣어 준다. */
export const SITE_URL = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
);

export const SITE_NAME = "My First Gear";
export const SITE_DESCRIPTION = "컴퓨터 부품부터 오디오, 탈것, 시계까지 첫 장비를 고르는 기어 숍 (포트폴리오 데모)";
