export { createDb, getDb, hasDatabase, resolveConnectionString } from "./client";
export type { Db } from "./client";
export * from "./schema";
export { applyMerch, listMerch, seedMerch, updateMerch } from "./merch";
export type { Merch, MerchPatch } from "./merch";
export {
  dashboardStats,
  findOrderForBuyer,
  getOrder,
  listOrders,
  OrderError,
  placeOrder,
  updateOrderStatus,
} from "./orders";
export type { Order, OrderLine, OrderWithLines, PlaceOrderInput } from "./orders";
export { createConsult, listConsults, updateConsultStatus } from "./consults";
export type { ConsultRequest } from "./consults";
export { resetDemoData } from "./reset";
