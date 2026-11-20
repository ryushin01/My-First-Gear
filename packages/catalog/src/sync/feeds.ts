/*
 * V 셋업 배치도와 주고받는 제품 목록(피드)의 모양.
 * 두 앱은 각자 자기 제품만 /feed/gear.json으로 내보내고, 상대 피드에서 자기에게 없는 제품만 가져온다.
 * 모양을 바꾸면 version을 올리고 V 쪽(src/entities/plan/model/sync)도 함께 바꾼다.
 */

export const V_PLANNER_URL = "https://v-setup-planner-ryushin01.vercel.app";

/** V가 내보내는 실제 모델 한 개. 크기는 cm, 전력은 W. */
export type PlannerFeedItem = {
  id: string;
  name: string;
  brand: string;
  /** V의 물건 종류 (desk, monitor, speaker 등) */
  kind: string;
  category: string;
  layer: string;
  width: number;
  depth: number;
  watts: number;
  wattsBasis?: string;
  cable: number;
  diagonalInch?: number;
  ports?: number;
  /** "estimate"면 제조사 치수를 찾지 못해 비슷한 제품으로 추정한 값 */
  dimsBasis?: "estimate";
};

export type PlannerFeed = { version: 1; source: "v"; items: PlannerFeedItem[] };

/** 이 쇼핑몰이 내보내는 상품 한 개 */
export type ShopFeedItem = {
  /** 상품 slug */
  id: string;
  name: string;
  brand: string;
  category: string;
  /** 판매가 (원, 가상 가격) */
  price: number;
  /** slug가 달라도 같은 제품인 V 모델 id */
  aliases?: string[];
  widthCm?: number;
  depthCm?: number;
  diagonalInch?: number;
  /** 화면 비율 (예: "21:9") */
  aspect?: string;
  /** 키보드 배열 (예: "텐키리스 (87키)") */
  layout?: string;
};

export type ShopFeed = { version: 1; source: "my-first-gear"; items: ShopFeedItem[] };
