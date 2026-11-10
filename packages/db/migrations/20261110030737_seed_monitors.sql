-- 게이밍 모니터 상품 판매 정보 시드 (이미 있는 상품은 그대로 둔다)
INSERT INTO "product_merch" ("product_id", "price", "list_price", "stock", "featured", "visible") VALUES
('p-mon-001', 1790000, 2090000, 7, false, true),
('p-mon-002', 1490000, NULL, 11, false, true),
('p-mon-003', 1390000, NULL, 5, false, true),
('p-mon-004', 989000, 1190000, 14, false, true)
ON CONFLICT ("product_id") DO NOTHING;
