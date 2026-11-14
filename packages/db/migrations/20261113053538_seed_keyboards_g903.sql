-- 키보드 5종과 G903 HERO 판매 정보 시드 (이미 있는 상품은 그대로 둔다)
INSERT INTO "product_merch" ("product_id", "price", "list_price", "stock", "featured", "visible") VALUES
('p-kb-006', 389000, NULL, 14, false, true),
('p-kb-007', 459000, NULL, 7, false, true),
('p-kb-008', 139000, NULL, 29, false, true),
('p-kb-009', 149000, NULL, 38, false, true),
('p-kb-010', 199000, NULL, 25, false, true),
('p-mouse-006', 149000, NULL, 18, false, true)
ON CONFLICT ("product_id") DO NOTHING;
