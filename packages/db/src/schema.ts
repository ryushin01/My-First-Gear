import { relations } from "drizzle-orm";
import { boolean, date, index, integer, jsonb, pgTable, primaryKey, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

/**
 * 상품의 판매 정보. 상품 설명, 사양, 그림은 @mfg/catalog 코드에 있고
 * 어드민에서 바꾸는 값(가격, 재고, 노출)만 DB에 둔다.
 */
export const productMerch = pgTable("product_merch", {
  productId: text("product_id").primaryKey(),
  price: integer("price").notNull(),
  listPrice: integer("list_price"),
  stock: integer("stock").notNull(),
  featured: boolean("featured").notNull().default(false),
  visible: boolean("visible").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** 쇼핑몰 회원. 비밀번호는 scrypt 해시로만 저장한다. */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orderStatuses = ["paid", "preparing", "assembling", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof orderStatuses)[number];

export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
    status: text("status").$type<OrderStatus>().notNull().default("paid"),
    buyerName: text("buyer_name").notNull(),
    buyerPhone: text("buyer_phone").notNull(),
    buyerEmail: text("buyer_email").notNull().default(""),
    address: text("address").notNull(),
    memo: text("memo").notNull().default(""),
    payment: text("payment").notNull(),
    subtotal: integer("subtotal").notNull(),
    shipping: integer("shipping").notNull(),
    total: integer("total").notNull(),
    assembly: boolean("assembly").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("orders_created_at_idx").on(table.createdAt), index("orders_user_id_idx").on(table.userId)],
);

export const orderLines = pgTable(
  "order_lines",
  {
    id: serial("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    itemId: text("item_id").notNull(),
    name: text("name").notNull(),
    price: integer("price").notNull(),
    quantity: integer("quantity").notNull(),
  },
  (table) => [index("order_lines_order_id_idx").on(table.orderId)],
);

export const ordersRelations = relations(orders, ({ many, one }) => ({
  lines: many(orderLines),
  events: many(orderEvents),
  user: one(users, { fields: [orders.userId], references: [users.id] }),
}));
export const orderLinesRelations = relations(orderLines, ({ one }) => ({
  order: one(orders, { fields: [orderLines.orderId], references: [orders.id] }),
}));

export const consultStatuses = ["new", "contacted", "closed"] as const;
export type ConsultStatus = (typeof consultStatuses)[number];

export const consultRequests = pgTable("consult_requests", {
  id: serial("id").primaryKey(),
  productSlug: text("product_slug"),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  preferredDate: date("preferred_date"),
  message: text("message").notNull().default(""),
  status: text("status").$type<ConsultStatus>().notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** 상품 후기. 회원 한 명이 상품마다 하나만 쓴다. */
export const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    productId: text("product_id").notNull(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("reviews_user_product_idx").on(table.userId, table.productId), index("reviews_product_idx").on(table.productId)],
);

/** 상품 Q&A. 답변은 어드민이 단다. */
export const questions = pgTable(
  "questions",
  {
    id: serial("id").primaryKey(),
    productId: text("product_id").notNull(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    answer: text("answer"),
    answeredAt: timestamp("answered_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("questions_product_idx").on(table.productId)],
);

export const inquiryCategories = ["order", "delivery", "assembly", "as", "etc"] as const;
export type InquiryCategory = (typeof inquiryCategories)[number];

/** 1:1 문의. 작성한 회원과 어드민만 본다. */
export const inquiries = pgTable(
  "inquiries",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    category: text("category").$type<InquiryCategory>().notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    answer: text("answer"),
    answeredAt: timestamp("answered_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("inquiries_user_idx").on(table.userId)],
);

export const wishlists = pgTable(
  "wishlists",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: text("product_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.productId] })],
);

/** 저장한 PC 견적. encoded는 /build?b= 주소에 쓰는 값과 같다. */
export const savedBuilds = pgTable(
  "saved_builds",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    encoded: text("encoded").notNull(),
    total: integer("total").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("saved_builds_user_idx").on(table.userId)],
);

export const usersRelations = relations(users, ({ many }) => ({ orders: many(orders) }));
export const reviewsRelations = relations(reviews, ({ one }) => ({ user: one(users, { fields: [reviews.userId], references: [users.id] }) }));
export const questionsRelations = relations(questions, ({ one }) => ({ user: one(users, { fields: [questions.userId], references: [users.id] }) }));
export const inquiriesRelations = relations(inquiries, ({ one }) => ({ user: one(users, { fields: [inquiries.userId], references: [users.id] }) }));

/** 회원의 장바구니와 PC 견적. 로그인하면 다른 기기에서도 이어서 쓴다. */
export type StoredCartLine = { productId: string; quantity: number };
export type StoredBuild = { parts: Record<string, string>; services: string[] };

export const memberStates = pgTable("member_states", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  cart: jsonb("cart").$type<StoredCartLine[]>().notNull().default([]),
  build: jsonb("build").$type<StoredBuild | null>(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** 로그인 세션. 쿠키에는 서명한 세션 id만 두고, 로그아웃하면 행을 지워 바로 무효로 만든다. */
export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("sessions_user_idx").on(table.userId)],
);

/** 로그인 시도 기록. key는 "member:이메일" 또는 "admin:IP" 같은 문자열의 해시다. */
export const loginAttempts = pgTable(
  "login_attempts",
  {
    id: serial("id").primaryKey(),
    key: text("key").notNull(),
    ok: boolean("ok").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("login_attempts_key_idx").on(table.key, table.createdAt)],
);

/** 재입고 알림 신청 */
export const restockRequests = pgTable(
  "restock_requests",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: text("product_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.productId] })],
);

/** 주문 상태 이력 (배송 단계 타임라인) */
export const orderEvents = pgTable(
  "order_events",
  {
    id: serial("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    status: text("status").$type<OrderStatus>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("order_events_order_idx").on(table.orderId)],
);

export const orderEventsRelations = relations(orderEvents, ({ one }) => ({
  order: one(orders, { fields: [orderEvents.orderId], references: [orders.id] }),
}));
