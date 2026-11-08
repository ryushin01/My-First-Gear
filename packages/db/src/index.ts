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
export { authenticate, AuthError, createUser, getUser, hashPassword, listMembers, verifyPassword } from "./auth";
export type { PublicUser } from "./auth";
export {
  answerInquiry,
  answerQuestion,
  CommunityError,
  countUnanswered,
  createInquiry,
  createQuestion,
  createReview,
  listInquiriesByUser,
  listInquiriesForAdmin,
  listQuestions,
  listQuestionsForAdmin,
  listReviews,
  maskName,
} from "./community";
export { deleteSavedBuild, isWished, listOrdersByUser, listSavedBuilds, listWishlist, saveBuild, toggleWish } from "./mypage";
export { DEMO_MEMBER } from "./seed";
