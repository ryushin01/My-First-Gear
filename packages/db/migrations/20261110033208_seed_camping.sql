-- 캠핑 상품 판매 정보 시드 (이미 있는 상품은 그대로 둔다)
INSERT INTO "product_merch" ("product_id", "price", "list_price", "stock", "featured", "visible") VALUES
('p-camp-001', 2190000, NULL, 3, false, true)
ON CONFLICT ("product_id") DO NOTHING;
