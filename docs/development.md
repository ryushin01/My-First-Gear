# 개발 가이드

## 전체 구조

pnpm 워크스페이스와 Turborepo로 묶은 모노레포입니다.

| 경로 | 역할 |
|---|---|
| `apps/shop` | 쇼핑몰. UnoCSS, Next.js 16 Cache Components(ISR 1분) |
| `apps/admin` | 어드민. Bulma 기본 스타일만 사용, 요청마다 DB를 읽는 동적 화면 |
| `packages/catalog` | 상품·카테고리 콘텐츠, 정렬·필터 쿼리, PC 호환성 검사, 조립 서비스 요금 |
| `packages/gear-art` | 상품 SVG 그림 (`<GearArt art={…} />`) |
| `packages/db` | Drizzle 스키마·마이그레이션(`migrations/`), 쿼리, 로컬 DB(PGlite) 실행 스크립트 |

두 앱은 Feature-Sliced Design v2.1을 따릅니다. Next.js와 이름이 겹치지 않도록 계층 이름은 `_app`, `_pages`를 쓰고, Next의 `app/` 라우트 파일은 `_pages`를 다시 내보내기만 합니다.

- 한 페이지에서만 쓰는 코드는 그 페이지 슬라이스의 `ui`·`api`·`model`에 둡니다 (예: PC 견적은 `_pages/pc-build`, 후기·Q&A·찜은 `_pages/product`). 두 곳 이상에서 쓰게 되면 features·widgets로 올립니다. 지금 features에는 로그인(`auth`), 어드민의 주문 상태 변경(`order-status`)만 있습니다.
- 같은 계층의 교차 import는 `@x` 공개 API로만 합니다 (`entities/product/@x/cart.ts`, `entities/member/@x/order.ts` 등).
- 서버 전용 코드는 `index.server.ts`로 내보냅니다 (`entities/product`, `entities/member`).
- `pnpm lint`가 steiger로 이 규칙을 검사합니다. `fsd/typo-in-layer-name`만 끕니다.

## 데이터 흐름

- **콘텐츠는 코드, 판매 정보는 DB.** 상품 설명·사양·그림·호환 정보는 `packages/catalog`에 두고, 어드민에서 바꾸는 가격·정가·재고·추천·노출만 `product_merch` 테이블에 둡니다.
- 쇼핑몰은 `getCatalog()`(`"use cache"`, 태그 `merch`)로 두 값을 합쳐 읽고, `CatalogProvider`로 클라이언트 컴포넌트에 나눠 줍니다. DB에 연결할 수 없으면 코드의 기본값을 씁니다.
- 주문은 서버 액션 `placeOrderAction`이 처리합니다. 클라이언트가 보낸 가격은 쓰지 않고, 한 트랜잭션 안에서 DB 가격으로 다시 계산하고 재고를 줄입니다. 그 뒤 `updateTag("merch")`로 캐시를 갱신합니다.
- 어드민이 판매 정보를 바꾸면 쇼핑몰의 `POST /api/revalidate`(헤더 `x-revalidate-secret`)를 호출해 캐시를 비웁니다.
- 장바구니와 PC 견적은 브라우저 `localStorage`에 둡니다. 견적은 `/build?b=…` 주소로 공유하고, 회원은 마이페이지에 저장할 수 있습니다.
- **회원 세션:** 이메일·비밀번호(scrypt 해시) 로그인. 서명한 `httpOnly` 쿠키 `mfg_session`으로 인증하고, 화면 표시용 이름만 `mfg_member` 쿠키에 둡니다. 세션을 읽는 코드는 `connection()`으로 요청 시점에만 실행합니다. 로그인 상태가 바뀌면 전체 페이지를 다시 불러옵니다 (Cache Components가 숨겨 둔 이전 화면이 남지 않게).
- **후기·Q&A:** `"use cache"` + 태그 `community:{상품 id}`. 회원이 쓰면 `updateTag`, 어드민이 답하면 쇼핑몰 `/api/revalidate`에 태그를 보내 갱신합니다.
- 회원으로 주문하면 `orders.user_id`에 연결되어 마이페이지 주문 내역에 나옵니다. 비회원 주문 조회도 그대로 됩니다.
- 스키마를 바꾸면 `pnpm --filter @mfg/db db:generate`로 `packages/db/migrations`에 마이그레이션을 만듭니다. 운영 배포(Vercel 빌드)와 로컬 DB 모두 `scripts/migrate.mjs`(Drizzle 마이그레이터)로 적용합니다. 이미 적용한 마이그레이션은 고치지 않고 새 마이그레이션을 추가합니다.

## 로컬 개발

`packages/db/scripts/with-db.mjs`가 PGlite(WASM Postgres)를 `pg-gateway`로 감싸 로컬 Postgres를 띄우고, 마이그레이션을 적용한 뒤 명령에 `MFG_DATABASE_URL`을 넘깁니다. 계정이나 Docker가 필요 없습니다.

```bash
pnpm --filter shop dev:db     # DB 파일은 apps/shop/.local-db에 남는다
pnpm --filter admin dev:db    # 같은 DB 폴더를 쓴다
```

DB 없이 `pnpm --filter shop dev`만 실행해도 화면은 뜨지만, 주문·조회·상담은 "서버에 연결할 수 없습니다"라고 안내합니다.

| 환경 변수 | 쓰는 곳 | 설명 |
|---|---|---|
| `DATABASE_URL` | 두 앱 | 운영 Postgres(Neon) 연결 문자열. Vercel의 Neon 연동이 넣어 준다 |
| `MFG_DATABASE_URL` | 두 앱 | 로컬·테스트 DB 연결 문자열 (`with-db.mjs`가 넣어 줌, `DATABASE_URL`보다 우선) |
| `MFG_REVALIDATE_SECRET` | 두 앱 | 쇼핑몰 캐시 갱신 엔드포인트의 비밀 값 |
| `MFG_SESSION_SECRET` | 쇼핑몰 | 회원 세션 쿠키 서명 키 (Vercel 운영 필수, 로컬은 개발용 기본값) |
| `CRON_SECRET` | 쇼핑몰 | 데모 초기화 크론(`/api/cron/reset-demo`) 확인용 |
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

33개 항목 대조 결과는 [접근성 점검표](accessibility.md)에 있습니다. 개발할 때 지키는 것:

- 폼은 레이블·필수 표시·도움말·오류를 `aria-describedby`로 연결하고, 제출에 실패하면 오류 요약으로 초점을 옮깁니다. 실패해도 입력값을 돌려받아 다시 채웁니다 (React 폼 액션은 제출 뒤 폼을 비우므로).
- 중복 제출은 `useSubmitLock`/`useActionFormLock`(`shared/lib`)의 `useRef` 잠금으로 막습니다. 상태 값(`pending`)은 다음 렌더에야 바뀌어 빠른 연속 클릭을 못 막기 때문입니다. 성공 뒤 화면을 떠나는 폼은 실패했을 때만 잠금을 풉니다.
- 고정 id를 쓰지 않습니다. Cache Components가 이전 화면을 숨긴 채 DOM에 남겨 id가 겹칩니다. 클라이언트 컴포넌트는 `useId`, 서버 컴포넌트는 화면마다 다른 접두사를 씁니다.
- 움직이는 효과는 하단 "효과" 토글과 `prefers-reduced-motion`으로 멈출 수 있어야 합니다.
- 조작 요소는 24×24px 이상(헤더 링크 32px, 버튼 44px)으로 둡니다.

## 테스트

| 명령 | 내용 |
|---|---|
| `pnpm test` | `packages/catalog` 호환성 검사(8), `packages/db` 로컬 Postgres(PGlite) 통합 테스트(10), 쇼핑몰 컴포넌트·스토리 테스트(28), 어드민 컴포넌트·세션 테스트(4) |
| `pnpm --filter shop test:e2e` | 쇼핑몰 프로덕션 빌드 + 로컬 DB, 데스크톱·모바일 50개. 13개 화면의 가로 넘침·24px 미만 조작 요소·axe, 중복 id, 캐러셀 키보드, 필터, 결제·조회, PC 견적, 상담, 회원 가입·로그인, 후기·Q&A·찜, 마이페이지, 더블 클릭 |
| `pnpm --filter admin test:e2e` | 쇼핑몰과 어드민을 같은 DB로 띄워 데스크톱·모바일 24개. 로그인, 가격 변경 반영, 주문·상담 상태, 문의 답변 반영, 가로 넘침·axe, 데모 초기화 크론 |
| `pnpm storybook` | `entities`, `shared`, `widgets` 컴포넌트 옆 `*.stories.tsx`. a11y 애드온 포함 |

- 컴포넌트 테스트는 컴포넌트 옆 `*.test.tsx`에 둡니다 (Vitest + Testing Library, jsdom).
- `src/stories.test.tsx`가 모든 스토리를 렌더링해 axe로 검사합니다. 명도 대비는 jsdom에서 판단할 수 없어 E2E에서 검사합니다.
- Node 26의 실험 기능인 전역 `localStorage`가 jsdom 저장소를 가리므로, Vitest는 `--no-experimental-webstorage`로 실행합니다 (`vitest.config.mts`).
- E2E는 먼저 `pnpm build`로 두 앱을 빌드해 둡니다. 다시 빌드할 때는 예전 서버를 끄고 `.next`를 지웁니다. 서버가 떠 있으면 재생성한 페이지를 새 `.next`에 덮어쓸 수 있습니다.
- Cache Components가 숨겨 둔 화면 때문에 E2E 선택자는 `getByRole`처럼 보이는 요소만 고르는 것을 씁니다.
