# 시퀀스 다이어그램

My First Gear의 주요 흐름입니다. 쇼핑몰(`apps/shop`)과 어드민(`apps/admin`)이 같은 PostgreSQL(`packages/db`)을 쓰고, 상품 정보와 호환성 규칙은 `packages/catalog`의 순수 TypeScript입니다.

## 1. PC 견적과 호환성 검사

```mermaid
sequenceDiagram
    actor 손님
    participant 견적 as BuildPlanner<br/>(_pages/pc-build)
    participant 상태 as 견적 상태<br/>(entities/build, 주소·브라우저 저장)
    participant 규칙 as checkBuild<br/>(packages/catalog/compatibility)
    participant 액션 as saveBuildAction
    participant DB as PostgreSQL

    손님->>견적: 부품 칸 고르기 (CPU, 메인보드, 메모리 …)
    견적->>상태: 부품 저장
    견적->>규칙: checkBuild(견적)
    규칙-->>견적: 문제 목록 (소켓, 메모리 규격, 보드 크기, 그래픽카드 길이·두께, 전원 커넥터, 쿨러 높이, 파워 용량)
    견적-->>손님: 호환성 결과, 예상 소비 전력, 총액
    손님->>견적: 견적 공유
    견적-->>손님: 견적이 담긴 주소와 공유 이미지(/api/og/build?b=…)
    손님->>견적: 마이페이지에 저장
    견적->>액션: saveBuildAction(이름, 견적, 총액)
    alt 로그인 안 함
        액션-->>견적: 회원만 저장할 수 있다는 안내
    else
        액션->>DB: 저장 (이름 40자, 견적 500자 제한)
        액션-->>견적: 저장 완료
    end
```

## 2. 모의 결제 주문

```mermaid
sequenceDiagram
    actor 손님
    participant 결제 as 결제 화면
    participant 액션 as placeOrderAction<br/>(entities/order)
    participant 주문 as placeOrder<br/>(packages/db/orders)
    participant DB as PostgreSQL
    participant 캐시 as Next 캐시 (merch 태그)

    손님->>결제: 받는 분, 연락처, 주소, 결제 수단
    결제->>액션: 장바구니 줄(최대 50), 구매자, 결제 수단
    액션->>액션: 이름·휴대폰·주소·이메일 형식 검사
    액션->>주문: placeOrder
    주문->>DB: 트랜잭션: 판매 정보 SELECT … FOR UPDATE
    Note over 주문,DB: 화면의 가격이 아니라 DB의 가격·재고로 다시 계산
    alt 판매 중지 / 상담 상품 / 재고 부족
        주문-->>액션: OrderError
        액션-->>결제: 이유 안내
    else
        주문->>DB: 재고 차감, 주문 저장 (조립 서비스 포함)
        주문-->>액션: 주문
        액션->>캐시: updateTag(merch) — 재고가 바뀜
        액션-->>결제: 주문 번호와 총액
    end
```

## 3. 어드민 판매 정보 변경과 쇼핑몰 반영

```mermaid
sequenceDiagram
    actor 운영자
    participant 어드민 as 상품 판매 정보<br/>(admin _pages/products)
    participant 액션 as updateMerchAction
    participant DB as PostgreSQL
    participant 쇼핑몰 as POST /api/revalidate<br/>(shop)
    participant 캐시 as 쇼핑몰 Next 캐시

    운영자->>어드민: 가격·정가·재고·추천·노출 수정
    어드민->>액션: FormData
    액션->>액션: 판매가 1원 이상, 정가 > 판매가, 재고 0 이상 정수
    alt 형식 오류
        액션-->>어드민: 안내와 입력값 유지
    else
        액션->>DB: updateMerch
        액션->>쇼핑몰: x-revalidate-secret 헤더와 함께 요청
        쇼핑몰->>쇼핑몰: 비밀 값 비교 (timingSafeEqual), 허용한 태그만
        쇼핑몰->>캐시: revalidateTag(merch)
        액션-->>어드민: 저장 완료
        Note over 캐시: 다음 쇼핑몰 요청부터 바뀐 가격·재고
    end
```
