import { coreProducts } from "./coreProducts";
import { deskSetupProducts } from "./deskSetupProducts";
import { withEnglish } from "./english";
import { premiumProducts } from "./premiumProducts";
import { linkToV, productsFromV } from "./sync/fromV";
import { vFeed } from "./sync/vFeed";
import type { Product } from "./types";

/**
 * 포트폴리오용 가상 상품 데이터.
 * 데스크 셋업 장비는 퓨처테리어 커뮤니티 게시글에 자주 나온 제품에서 골랐다.
 * 이 쇼핑몰이 직접 올린 상품이고, V 배치도에도 있는 제품에는 V 모델 id를 단다.
 * 이름·브랜드가 한글이면 영문 이름과 브랜드 영문 표기를 함께 단다(영어 병기, english.ts).
 */
export const nativeProducts: Product[] = linkToV([...coreProducts, ...deskSetupProducts, ...premiumProducts], vFeed).map(withEnglish);

/** V 배치도에만 있던 제품을 더한 전체 상품. V 피드는 매일 동기화한다(scripts/sync-v-feed.mjs). */
export const products: Product[] = [...nativeProducts, ...productsFromV(vFeed, nativeProducts).map(withEnglish)];
