/** 조립 서비스 항목. 요금은 포트폴리오용 가상 값이다. */
export type AssemblyService = {
  id: string;
  name: string;
  price: number;
  description: string;
  /** 조립을 고르면 함께 들어가는 기본 항목 */
  required?: boolean;
};

export const assemblyServices: AssemblyService[] = [
  {
    id: "svc-assembly",
    name: "기본 조립",
    price: 30_000,
    description: "부품 장착, 배선, 바이오스 설정까지 마칩니다.",
    required: true,
  },
  {
    id: "svc-os",
    name: "운영체제 설치",
    price: 20_000,
    description: "운영체제와 드라이버를 설치하고 업데이트합니다. 라이선스는 따로 준비해 주세요.",
  },
  {
    id: "svc-cable",
    name: "선 정리",
    price: 15_000,
    description: "케이블 타이로 선을 정리해 공기 흐름과 보기를 좋게 합니다.",
  },
  {
    id: "svc-burnin",
    name: "24시간 동작 테스트",
    price: 20_000,
    description: "부하 테스트를 돌려 온도와 안정성을 확인한 뒤 보고서를 드립니다.",
  },
];

export function getService(id: string): AssemblyService | undefined {
  return assemblyServices.find((service) => service.id === id);
}

/** 배송비. 5만 원 이상이면 무료 */
export const FREE_SHIPPING_FROM = 50_000;
export const SHIPPING_FEE = 3_000;

export function shippingFee(subtotal: number): number {
  return subtotal === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;
}
