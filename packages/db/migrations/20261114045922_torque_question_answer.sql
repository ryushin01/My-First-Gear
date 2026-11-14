-- 안텍 토크 상품 질문의 답변을 실제 사양(그래픽카드 길이 최대 450mm)에 맞춘다. 운영자가 고친 답변은 건드리지 않는다.
UPDATE "questions"
SET "answer" = '네, 그래픽카드 길이 450mm까지 장착할 수 있어 304mm인 RTX 5070 Ti는 넉넉히 들어갑니다.'
WHERE "product_id" = 'p-case-001'
  AND "answer" = '네, 그래픽카드 길이 330mm까지 장착할 수 있어 304mm인 RTX 5070 Ti는 들어갑니다.';
