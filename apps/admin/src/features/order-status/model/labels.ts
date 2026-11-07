import type { OrderStatus } from "@mfg/db";

export const orderStatusLabel: Record<OrderStatus, string> = {
  paid: "결제 완료",
  preparing: "상품 준비 중",
  assembling: "조립 중",
  shipped: "배송 중",
  delivered: "배송 완료",
  cancelled: "주문 취소",
};

export const orderStatusTag: Record<OrderStatus, string> = {
  paid: "is-info",
  preparing: "is-link",
  assembling: "is-warning",
  shipped: "is-primary",
  delivered: "is-success",
  cancelled: "is-light",
};

export const orderStatusOptions = (Object.keys(orderStatusLabel) as OrderStatus[]).map((value) => ({
  value,
  label: orderStatusLabel[value],
}));
