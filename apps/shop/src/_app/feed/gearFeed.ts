import { shopFeed } from "@mfg/catalog";

/**
 * V 셋업 배치도가 매일 가져가는 상품 목록(/feed/gear.json). 이 쇼핑몰이 직접 올린 상품만 싣는다.
 * 요청 값을 읽지 않으므로 빌드할 때 정적으로 만든다.
 */
export function GET() {
  return Response.json(shopFeed());
}
