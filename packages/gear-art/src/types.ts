/** 상품 그림 값. model: 상품별 실사풍 그림 키(상품 slug). 그림이 없으면 kind의 선 그림을 쓴다. */
export type GearArtValue = { kind: string; accent: string; variant?: string; model?: string };
