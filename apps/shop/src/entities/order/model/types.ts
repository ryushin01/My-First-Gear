export type Result<T> = { ok: true; data: T } | { ok: false; message: string };

export type OrderStatus = "paid" | "preparing" | "assembling" | "shipped" | "delivered" | "cancelled";

export const orderStatusLabel: Record<OrderStatus, string> = {
  paid: "결제 완료",
  preparing: "상품 준비 중",
  assembling: "조립 중",
  shipped: "배송 중",
  delivered: "배송 완료",
  cancelled: "주문 취소",
};

export type PaymentMethod = "card" | "transfer" | "easy";

export const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: "card", label: "신용카드 (모의)" },
  { value: "transfer", label: "계좌이체 (모의)" },
  { value: "easy", label: "간편결제 (모의)" },
];

export type Buyer = { name: string; phone: string; email: string; address: string; memo: string };

export type PlaceOrderRequest = {
  lines: { itemId: string; quantity: number }[];
  buyer: Buyer;
  payment: PaymentMethod;
  /** 결제 화면이 만든 제출 번호. 응답이 끊겨 다시 결제해도 주문이 두 번 생기지 않게 한다. */
  submissionId?: string;
};

export type OrderSummary = {
  assembly?: boolean;
  events?: { status: OrderStatus; createdAt: string }[];
  id: string;
  status: OrderStatus;
  total: number;
  lines: { name: string; price: number; quantity: number }[];
};
