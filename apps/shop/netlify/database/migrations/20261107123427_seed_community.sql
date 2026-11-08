-- 데모 회원(비밀번호 demo1234), 후기, 상품 질문 시드
INSERT INTO "users" ("id", "email", "name", "password_hash") VALUES
(1, 'demo@myfirstgear.dev', '김기어', 'scrypt$mfg-demo-salt-01$3Lu_oRwEDLMubedUEtxMFw0azqixCCXG5LvN57Y7HV4'),
(2, 'lee@example.com', '이데모', 'scrypt$mfg-demo-salt-01$3Lu_oRwEDLMubedUEtxMFw0azqixCCXG5LvN57Y7HV4'),
(3, 'park@example.com', '박예시', 'scrypt$mfg-demo-salt-01$3Lu_oRwEDLMubedUEtxMFw0azqixCCXG5LvN57Y7HV4')
ON CONFLICT DO NOTHING;
--> statement-breakpoint
SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT max(id) FROM "users"));
--> statement-breakpoint
INSERT INTO "reviews" ("product_id", "user_id", "rating", "body") VALUES
('p-cpu-001', 2, 5, '게임 프레임이 확실히 올랐습니다. 공랭으로도 온도가 안정적이에요.'),
('p-cpu-001', 3, 4, '성능은 만족, 가격이 조금 아쉽습니다.'),
('p-case-001', 2, 5, '부품이 다 보여서 책상 위 오브제가 됐습니다. 조립 서비스 추천합니다.'),
('p-dap-003', 3, 5, '묵직한 무게만큼 소리가 차분합니다. 금색 바디가 예뻐요.'),
('p-bike-001', 2, 4, '지하철 타고 출근할 때 접어서 들고 다닙니다. 생각보다 가벼워요.'),
('p-watch-001', 3, 5, '38.5mm라 손목이 얇아도 잘 맞습니다.')
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "questions" ("product_id", "user_id", "body", "answer", "answered_at") VALUES
('p-case-001', 3, 'RTX 5070 Ti도 들어가나요?', '네, 그래픽카드 길이 330mm까지 장착할 수 있어 304mm인 RTX 5070 Ti는 들어갑니다.', now()),
('p-gpu-001', 2, '750W 파워로 충분할까요?', NULL, NULL);
