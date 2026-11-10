import { coreProducts } from "./coreProducts";
import { deskSetupProducts } from "./deskSetupProducts";
import type { Product } from "./types";

/**
 * 포트폴리오용 가상 상품 데이터.
 * 데스크 셋업 장비는 퓨처테리어 커뮤니티 게시글에 자주 나온 제품에서 골랐다.
 */
export const products: Product[] = [...coreProducts, ...deskSetupProducts];
