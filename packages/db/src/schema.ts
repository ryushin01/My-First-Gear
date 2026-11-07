import { relations } from "drizzle-orm";
import { boolean, date, index, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

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

export const orderStatuses = ["paid", "preparing", "assembling", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof orderStatuses)[number];

export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey(),
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
  (table) => [index("orders_created_at_idx").on(table.createdAt)],
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

export const ordersRelations = relations(orders, ({ many }) => ({ lines: many(orderLines) }));
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
