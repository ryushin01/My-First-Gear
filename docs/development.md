# 개발 가이드

## 전체 구조

pnpm 워크스페이스와 Turborepo로 묶은 모노레포입니다.

| 경로 | 역할 |
|---|---|
| `apps/shop` | 쇼핑몰. UnoCSS, Next.js 16 Cache Components(ISR 1분) |
| `apps/admin` | 어드민. Bulma 기본 스타일만 사용, 요청마다 DB를 읽는 동적 화면 |
| `packages/catalog` | 상품·카테고리 콘텐츠, 정렬·필터 쿼리, PC 호환성 검사, 조립 서비스 요금 |
| `packages/gear-art` | 상품 SVG 그림 (`<GearArt art={…} />`) |
| `packages/db` | Drizzle 스키마, 주문·판매 정보·상담 쿼리, 로컬 DB 실행 스크립트 |

두 앱은 Feature-Sliced Design v2.1을 따릅니다. Next.js와 이름이 겹치지 않도록 계층 이름은 `_app`, `_pages`를 쓰고, Next의 `app/` 라우트 파일은 `_pages`를 다시 내보내기만 합니다. 같은 계층의 교차 import는 `@x` 공개 API로만 합니다 (`entities/product/@x/cart.ts` 등). `pnpm lint`가 steiger로 이 규칙을 검사합니다.

## 데이터 흐름

- **콘텐츠는 코드, 판매 정보는 DB.** 상품 설명·사양·그림·호환 정보는 `packages/catalog`에 두고, 어드민에서 바꾸는 가격·정가·재고·추천·노출만 `product_merch` 테이블에 둡니다.
- 쇼핑몰은 `getCatalog()`(`"use cache"`, 태그 `merch`)로 두 값을 합쳐 읽고, `CatalogProvider`로 클라이언트 컴포넌트에 나눠 줍니다. DB에 연결할 수 없으면 코드의 기본값을 씁니다.
- 주문은 서버 액션 `placeOrderAction`이 처리합니다. 클라이언트가 보낸 가격은 쓰지 않고, 한 트랜잭션 안에서 DB 가격으로 다시 계산하고 재고를 줄입니다. 그 뒤 `updateTag("merch")`로 캐시를 갱신합니다.
- 어드민이 판매 정보를 바꾸면 쇼핑몰의 `POST /api/revalidate`(헤더 `x-revalidate-secret`)를 호출해 캐시를 비웁니다.
- 장바구니와 PC 견적은 브라우저 `localStorage`에 둡니다. 견적은 `/build?b=…` 주소로 공유할 수 있습니다.
- 스키마를 바꾸면 `pnpm --filter @mfg/db db:generate`로 `apps/shop/netlify/database/migrations`에 마이그레이션을 만듭니다. 이미 적용한 마이그레이션은 고치지 않고 새 마이그레이션을 추가합니다.

## 로컬 개발

`packages/db/scripts/with-db.mjs`가 `@netlify/database-dev`로 로컬 Postgres를 띄우고, 마이그레이션을 적용한 뒤 명령에 `MFG_DATABASE_URL`을 넘깁니다.

```bash
pnpm --filter shop dev:db     # DB 파일은 apps/shop/.netlify/db-dev에 남는다
pnpm --filter admin dev:db    # 같은 DB 폴더를 쓴다
```

DB 없이 `pnpm --filter shop dev`만 실행해도 화면은 뜨지만, 주문·조회·상담은 "서버에 연결할 수 없습니다"라고 안내합니다.

| 환경 변수 | 쓰는 곳 | 설명 |
|---|---|---|
| `MFG_DATABASE_URL` | 두 앱 | Postgres 연결 문자열. 쇼핑몰은 Netlify에서 `NETLIFY_DB_URL`을 자동으로 쓴다 |
| `MFG_REVALIDATE_SECRET` | 두 앱 | 쇼핑몰 캐시 갱신 엔드포인트의 비밀 값 |
| `MFG_SHOP_URL` | 어드민 | 쇼핑몰 주소 (캐시 갱신 호출용) |
| `MFG_ADMIN_SECRET` | 어드민 | 세션 쿠키 서명 키 (운영 필수) |
| `MFG_ADMIN_PASSWORD` | 어드민 | 로그인 비밀번호. 없으면 공개 데모 비밀번호 `demo-admin` |

## 디자인 기준 (쇼핑몰)

[Arc Marumo](https://www.arcmarumo.com/)의 브라운관 TV와 VHS 테이프 콘셉트를 참고했습니다. 로고와 레이아웃은 복제하지 않았습니다.

- 색: 배경 `#111`, 포인트 `#ff3131`, 크림 `#fcf8ef`, 회색 `#e4dfd9`·`#b2aeab`, 색 번짐 `#ff2846`·`#2896ff` (`uno.config.ts`)
- 글꼴: 큰 제목 Instrument Serif + Gowun Batang, 라벨 JetBrains Mono, 본문 Pretendard
- 장치: 화면 전체 브라운관 프레임(주사선·노이즈·비네트), 타임코드, `[대괄호]` 고정폭 라벨, 흑백 토글, 눈금 진행 막대, "Next tape"
- 글자를 휘거나 기울이는 장식은 쓰지 않고, 목록·견적·결제 화면은 읽기 쉽게 평평하게 둡니다.
- 상품 그림은 `packages/gear-art`에서 종류별로 그립니다. 로고·엠블럼·상표 문양은 넣지 않습니다.

## 접근성 (KWCAG 2.2)

- 본문 바로가기, `lang="ko"`, 페이지별 제목, 제목 순서, 표 `caption`·`th scope`
- 캐러셀은 APG Carousel 패턴(자동 넘김 없음, 이전·다음 버튼, ← → 키, 현재 슬라이드만 초점 가능)
- 부품 선택은 네이티브 `<dialog>`로 초점을 가두고 닫으면 원래 버튼으로 돌아갑니다.
- 폼은 레이블·필수 표시·도움말·오류를 `aria-describedby`로 연결하고, 제출 실패 시 오류 요약에 초점을 둡니다. `autocomplete`를 지정합니다.
- 깜빡임은 밝기 변화를 아주 작게 두고, `prefers-reduced-motion`이면 애니메이션을 끕니다.
- 저장 버튼은 처리 중에 비활성화해 중복 제출을 막습니다.

## 테스트

| 명령 | 내용 |
|---|---|
| `pnpm test` | `packages/catalog` 호환성 검사, `packages/db` 로컬 Postgres 통합 테스트(주문 재계산, 재고, 조회, 대시보드) |
| `pnpm --filter shop test:e2e` | 쇼핑몰 프로덕션 빌드 + 로컬 DB. 10개 화면 가로 넘침·axe, 캐러셀 키보드, 필터, 장바구니→결제→조회, PC 견적 호환성, 상담, 흑백 토글 (데스크톱·모바일) |
| `pnpm --filter admin test:e2e` | 쇼핑몰과 어드민을 같은 DB로 함께 띄워 로그인, 가격 변경 반영, 주문 상태 변경, 상담 처리, axe |
| `pnpm storybook` | `entities`, `shared`, `widgets` 컴포넌트 옆 `*.stories.tsx`. a11y 애드온 포함 |

E2E는 먼저 `pnpm build`로 두 앱을 빌드해 둡니다. 로컬에서는 설치된 Chrome을, CI에서는 Playwright Chromium을 씁니다.
