# 개발 가이드

## 전체 구조

pnpm 워크스페이스와 Turborepo로 묶은 모노레포입니다.

| 경로 | 역할 |
|---|---|
| `apps/shop` | 쇼핑몰. UnoCSS, Next.js 16 Cache Components(ISR 1분) |
| `apps/admin` | 어드민. Bulma 기본 스타일만 사용, 요청마다 DB를 읽는 동적 화면 |
| `packages/catalog` | 상품·카테고리 콘텐츠, 정렬·필터 쿼리, PC 호환성 검사, 조립 서비스 요금 |
| `packages/gear-art` | 상품 SVG 그림 (`<GearArt art={…} />`) |
| `packages/hooks` | 두 앱이 함께 쓰는 React 훅. 중복 제출 잠금(`useSubmitLock`, `useActionFormLock`) |
| `packages/db` | Drizzle 스키마·마이그레이션(`migrations/`), 쿼리, 로컬 DB(PGlite) 실행 스크립트 |

두 앱은 Feature-Sliced Design v2.1을 따릅니다. Next.js와 이름이 겹치지 않도록 계층 이름은 `_app`, `_pages`를 쓰고, Next의 `app/` 라우트 파일은 `_pages`를 다시 내보내기만 합니다.

- 한 페이지에서만 쓰는 코드는 그 페이지 슬라이스의 `ui`·`api`·`model`에 둡니다 (예: PC 견적은 `_pages/pc-build`, 후기·Q&A·찜은 `_pages/product`). 두 곳 이상에서 쓰게 되면 features·widgets로 올립니다. 지금 features에는 로그인(`auth`), 어드민의 주문 상태 변경(`order-status`)만 있습니다.
- 같은 계층의 교차 import는 `@x` 공개 API로만 합니다 (`entities/product/@x/cart.ts`, `entities/member/@x/order.ts` 등).
- 서버 전용 코드는 `index.server.ts`로 내보냅니다 (`entities/product`, `entities/member`).
- `pnpm lint`가 steiger로 이 규칙을 검사합니다. `fsd/typo-in-layer-name`만 끕니다.

## 데이터 흐름

- **콘텐츠는 코드, 판매 정보는 DB.** 상품 설명·사양·그림·호환 정보는 `packages/catalog`(기본 상품 `coreProducts.ts`, 데스크 셋업 `deskSetupProducts.ts`)에 두고, 어드민에서 바꾸는 가격·정가·재고·추천·노출만 `product_merch` 테이블에 둡니다.
- 쇼핑몰은 `getCatalog()`(`"use cache"`, 태그 `merch`)로 두 값을 합쳐 읽고, `CatalogProvider`로 클라이언트 컴포넌트에 나눠 줍니다. DB에 연결할 수 없으면 코드의 기본값을 씁니다.
- 주문은 서버 액션 `placeOrderAction`이 처리합니다. 클라이언트가 보낸 가격은 쓰지 않고, 한 트랜잭션 안에서 DB 가격으로 다시 계산하고 재고를 줄입니다. 같은 상품이 여러 줄이면 합친 수량으로 재고를 확인하고(서버 액션은 누구나 직접 부를 수 있음), 조립 서비스는 한 번만 받습니다. 주문 번호(`MFG-YYMMDD-NNNNNN`)는 암호학적 난수로 만들고 겹치면 새 번호로 다시 넣습니다. 그 뒤 `updateTag("merch")`로 캐시를 갱신합니다.
- 어드민이 판매 정보를 바꾸면 쇼핑몰의 `POST /api/revalidate`(헤더 `x-revalidate-secret`)를 호출해 캐시를 비웁니다.
- 장바구니와 PC 견적은 브라우저 `localStorage`에 둡니다. 견적은 `/build?b=…` 주소로 공유하고, 회원은 마이페이지에 저장할 수 있습니다.
- **회원 세션:** 이메일·비밀번호(scrypt 해시, 비동기로 계산해 이벤트 루프를 막지 않음) 로그인. 없는 이메일도 가짜 해시를 한 번 검사해 응답 시간으로 가입 여부가 드러나지 않게 합니다. 세션은 DB(`sessions`)에 두고 `httpOnly` 쿠키 `mfg_session`에는 서명한 세션 id만 담습니다. 로그아웃하면 행을 지워 그 쿠키는 바로 무효가 됩니다. 화면 표시용 이름만 `mfg_member` 쿠키에 둡니다. 서버 세션이 사라졌는데(데모 초기화·만료) 이 쿠키가 남으면, 서버 액션(`getActionUserId`)이 두 쿠키를 지우고 회원 동기화가 화면을 로그인 전 모습으로 바꿉니다. 로그아웃하면 이 기기의 장바구니·견적을 비웁니다(서버에 저장되어 다음 로그인 때 돌아옴).
- **시도 제한:** `login_attempts`(키는 해시)에 기록하고 `RATE_LIMITS`(`packages/db/src/member.ts`)의 규칙으로 막습니다.

  | 대상 | 키 | 한도 |
  |---|---|---|
  | 회원 로그인 | 이메일+IP / IP | 10분에 5번 틀림 / 10분에 30번 틀림 |
  | 어드민 로그인 | IP | 10분에 5번 틀림 |
  | 비회원 주문 조회 | IP | 10분에 10번 맞지 않음 |
  | 구매 상담 신청·회원 가입 | IP | 1시간에 5번 |

  이메일만 보면 남의 이메일로 일부러 틀려 그 사람을 잠글 수 있어 IP를 함께 봅니다. IP는 Vercel이 채우는 `x-forwarded-for`의 첫 값이고(`clientIp`), 같은 컴퓨터에서 온 요청(로컬 개발·E2E)은 IP 기준 제한을 건너뜁니다. E2E는 가짜 IP 헤더로 제한을 시험합니다.
- **회원 장바구니·견적 동기화:** 로그인하면 서버에 저장한 값(`member_states`)과 이 기기의 값을 합치고(같은 상품은 많은 수량), 바뀔 때마다 0.8초 뒤 저장합니다(`widgets/crt-screen/ui/MemberSync.tsx`). 세션을 읽는 코드는 `connection()`으로 요청 시점에만 실행합니다. 로그인 상태가 바뀌면 전체 페이지를 다시 불러옵니다 (Cache Components가 숨겨 둔 이전 화면이 남지 않게).
- **평점·후기 수:** 카탈로그의 누적 후기(가상 값)에 DB 후기를 더해 다시 계산합니다(`applyMerch`). 후기를 쓰면 `merch` 태그도 갱신합니다.
- **카탈로그 전송:** 가격·재고를 반영한 카탈로그는 필요한 화면(목록, 검색, 견적, 장바구니, 결제, 비교)만 `WithCatalog`로 감싸 넘깁니다. 모든 화면에 상품 전체를 싣지 않습니다.
- **주문 상태 이력:** 주문을 만들거나 상태를 바꿀 때 `order_events`에 남겨 배송 단계 타임라인으로 보여 줍니다(같은 상태로는 남기지 않음). 회원은 결제 완료·상품 준비 중일 때만 직접 취소할 수 있고, 어드민이 취소해도 재고가 돌아옵니다. 취소는 "취소할 수 있는 상태일 때만" 바꾸는 UPDATE 한 번이라 동시에 두 번 와도 재고는 한 번만 돌아오고, 취소한 주문은 다시 바꿀 수 없습니다.
- **후기·Q&A:** `"use cache"` + 태그 `community:{상품 id}`. 회원이 쓰면 `updateTag`, 어드민이 답하면 쇼핑몰 `/api/revalidate`에 태그를 보내 갱신합니다.
- 회원으로 주문하면 `orders.user_id`에 연결되어 마이페이지 주문 내역에 나옵니다. 비회원 주문 조회도 그대로 됩니다.
- **공유 주소:** `/build?b=`(마이페이지 "불러오기" 포함)와 `/setup?s=`는 열 때 한 번만 적용하고 주소에서 공유 값을 지웁니다. 고르던 것이 다르면 따로 남겨 "이전 ○○으로 되돌리기"를 보여 줍니다(`createShareUndo`, `SharedNotice`).
- 스키마를 바꾸면 `pnpm --filter @mfg/db db:generate`로 `packages/db/migrations`에 마이그레이션을 만듭니다. 운영 배포(Vercel 빌드)와 로컬 DB 모두 `scripts/migrate.mjs`(Drizzle 마이그레이터)로 적용합니다. 이미 적용한 마이그레이션은 고치지 않고 새 마이그레이션을 추가합니다.

## 오류 처리

- **404·오류 화면:** 쇼핑몰은 `app/not-found.tsx`·`error.tsx`·`global-error.tsx`가 `src/_app/errors`의 브라운관 화면을 다시 내보냅니다. 오류 화면은 저장값·회원 상태를 읽는 머리글 부분(장바구니 수량, 로그인 링크, 회원 동기화)을 뺀 `CrtScreen bare`로 그려, 그 부분이 원인이어도 다시 죽지 않습니다. 오류는 `reportError`로 모니터링에 보냅니다(Sentry DSN이 있을 때). 어드민은 Bulma 모양으로 같은 세 파일을 둡니다.
- **없는 상품·카테고리:** Cache Components에서는 `dynamicParams`를 쓸 수 없고, 부분 프리렌더가 껍데기를 먼저 보내 상태 코드는 200입니다. 대신 Next가 `noindex`를 붙이고, 그 화면의 메타데이터 제목도 404 화면과 같게 둡니다(`NOT_FOUND_TITLE`).
- **서버 액션을 직접 부를 때**(결제, 상담, 주문 조회, 견적 저장, 찜, 재입고, 로그아웃)는 `callAction`(`@mfg/hooks`)으로 감쌉니다. 연결이 끊기거나 서버가 던져도 `{ ok: false, message }`로 받아 잠금을 풀고 입력을 그대로 둡니다. 그대로 두면 `await`가 던져 버튼이 "처리 중"에 멈추고, 전환 안에서는 오류 화면까지 올라갑니다.
- **폼 액션(`useActionState`)**은 감싸지 않고 서버 액션을 그대로 넘깁니다(JS를 받기 전에도 제출되게). 대신 액션 안에서 `guardAction`(각 앱 `shared/lib/server`)으로 예상하지 못한 DB 오류를 잡아 입력값과 함께 안내합니다. `redirect()` 같은 Next 신호는 그대로 던집니다.
- **브라우저 저장값:** `createLocalStore`의 `parse`가 저장된 값을 정리합니다. 장바구니는 모양이 다른 줄을 빼고, 견적은 모르는 칸을 빼고, 목록은 문자열만 남깁니다. 쓸 수 없으면 초기값으로 시작합니다(머리글의 장바구니 수량이 모든 화면에서 읽으므로 깨진 값이 남으면 사이트 전체가 열리지 않음).

## 로컬 개발

`packages/db/scripts/with-db.mjs`가 PGlite(WASM Postgres)를 `pg-gateway`로 감싸 로컬 Postgres를 띄우고, 마이그레이션을 적용한 뒤 명령에 `MFG_DATABASE_URL`을 넘깁니다. 계정이나 Docker가 필요 없습니다.

```bash
pnpm --filter shop dev:db     # DB 파일은 apps/shop/.local-db에 남는다
pnpm --filter admin dev:db    # 같은 DB 폴더를 쓴다
```

DB 없이 `pnpm --filter shop dev`만 실행해도 화면은 뜨지만, 주문·조회·상담은 "서버에 연결할 수 없습니다"라고 안내합니다.

PGlite를 PostgreSQL 주 버전이 다른 판으로 올리면(0.3 → 0.5는 PostgreSQL 17 → 18) 예전 `.local-db` 폴더는 열 수 없습니다. 스크립트가 폴더의 버전과 지금 버전을 알려 주므로, 폴더를 지우고 다시 실행해 새로 만듭니다(로컬에서 넣은 주문·상담 등은 지워집니다).

| 환경 변수 | 쓰는 곳 | 설명 |
|---|---|---|
| `DATABASE_URL` | 두 앱 | 운영 Postgres(Neon) 연결 문자열. Vercel의 Neon 연동이 넣어 준다 |
| `MFG_DATABASE_URL` | 두 앱 | 로컬·테스트 DB 연결 문자열 (`with-db.mjs`가 넣어 줌, `DATABASE_URL`보다 우선) |
| `MFG_REVALIDATE_SECRET` | 두 앱 | 쇼핑몰 캐시 갱신 엔드포인트의 비밀 값 |
| `MFG_SESSION_SECRET` | 쇼핑몰 | 회원 세션 쿠키 서명 키 (Vercel 운영 필수, 로컬은 개발용 기본값) |
| `CRON_SECRET` | 쇼핑몰 | 데모 초기화 크론(`/api/cron/reset-demo`) 확인용 |
| `NEXT_PUBLIC_SITE_URL` | 쇼핑몰 | 선택. sitemap·OG 절대 주소. 없으면 Vercel의 운영 주소(`VERCEL_PROJECT_PRODUCTION_URL`) |
| `MFG_SHOP_URL` | 어드민 | 쇼핑몰 주소 (캐시 갱신 호출용) |
| `MFG_ADMIN_SECRET` | 어드민 | 세션 쿠키 서명 키 (운영 필수) |
| `MFG_ADMIN_PASSWORD` | 어드민 | 로그인 비밀번호. 없으면 공개 데모 비밀번호 `demo-admin` |

## 디자인 기준 (쇼핑몰)

[Arc Marumo](https://www.arcmarumo.com/)의 브라운관 TV와 VHS 테이프 콘셉트를 참고했습니다. 로고와 레이아웃은 복제하지 않았습니다.

- 색: 배경 `#111`, 포인트 `#ff3131`, 크림 `#fcf8ef`, 회색 `#e4dfd9`·`#b2aeab`, 색 번짐 `#ff2846`·`#2896ff` (`uno.config.ts`)
- 글꼴: 영문·숫자는 큰 제목과 본문 모두 Azeret Mono(고정폭, 가변 굵기), 한글 큰 제목 Black And White Picture(흑백 영화 자막), 한글 본문 Gothic A1, 라벨과 견적 금액 Nanum Gothic Coding. 모두 `next/font/google`로 빌드 때 받아 함께 배포하고, 한글 글꼴은 화면에 쓰인 글자 묶음의 조각만 받습니다. 공유 이미지(`next/og`)는 그대로 Pretendard Bold를 씁니다.
- 장치: 화면 전체 브라운관 프레임(주사선·노이즈·비네트), 타임코드, `[대괄호]` 고정폭 라벨, 흑백 토글, 눈금 진행 막대, "Next tape"
- 글자를 휘거나 기울이는 장식은 쓰지 않고, 목록·견적·결제 화면은 읽기 쉽게 평평하게 둡니다.
- 상품 그림은 `packages/gear-art`에 있습니다. `art.model`(상품 slug)에 맞는 실사풍 그림이 `src/models/`(PC 부품 `pc.tsx`, 기기·모니터 `devices.tsx`, 탈것 `vehicles.tsx`, 시계 `watches.tsx`, 아웃도어 `outdoor.tsx`, 데스크 셋업 `desk.tsx`)에 있으면 그것을, 없으면 `art.kind`별 선 그림(`drawings.tsx`)을 씁니다.
- 실사풍 그림은 실제 제품의 형태·색·재질을 참고하고, 로고·엠블럼·상표 문양과 글자(`<text>`)는 넣지 않습니다. 같은 그림이 한 화면에 여러 번 나와 id가 겹치므로 그라데이션 대신 면을 겹쳐 명암을 냅니다. 공유 이미지 직렬화기(`toSvgString`)가 읽을 수 있게 훅 없는 JSX로만 씁니다.

## 접근성 (KWCAG 2.2)

33개 항목 대조 결과는 [접근성 점검표](accessibility.md)에 있습니다. 개발할 때 지키는 것:

- 폼은 레이블·필수 표시·도움말·오류를 `aria-describedby`로 연결하고, 제출에 실패하면 오류 요약으로 초점을 옮깁니다. 실패해도 입력값을 돌려받아 다시 채웁니다 (React 폼 액션은 제출 뒤 폼을 비우므로).
- 중복 제출은 `useSubmitLock`/`useActionFormLock`(`packages/hooks`, 각 앱의 `shared/lib`이 다시 내보냄)의 `useRef` 잠금으로 막습니다. 상태 값(`pending`)은 다음 렌더에야 바뀌어 빠른 연속 클릭을 못 막기 때문입니다. 성공 뒤 화면을 떠나는 폼은 실패했을 때만 잠금을 풉니다.
- 고정 id를 쓰지 않습니다. Cache Components가 이전 화면을 숨긴 채 DOM에 남겨 id가 겹칩니다. 클라이언트 컴포넌트는 `useId`, 서버 컴포넌트는 화면마다 다른 접두사를 씁니다.
- 움직이는 효과는 하단 "효과" 토글과 `prefers-reduced-motion`으로 멈출 수 있어야 합니다.
- 조작 요소는 24×24px 이상(헤더 링크 32px, 버튼 44px)으로 둡니다.

## 테스트

| 명령 | 내용 |
|---|---|
| `pnpm test` | `packages/catalog` 호환성·검색·예산 추천(14), `packages/db` 로컬 Postgres(PGlite) 통합 테스트(17), 쇼핑몰 컴포넌트·접근성·장바구니 호환성·동기화 테스트(27), 어드민 컴포넌트·세션 테스트(4) |
| `pnpm --filter shop test:e2e` | 쇼핑몰 프로덕션 빌드 + 로컬 DB, 데스크톱·모바일 74개. 검색, 빠른 견적, 비교, 최근 본 상품, 장바구니 호환성, 기기 간 동기화, 주문 취소·배송 단계, 재입고 알림, 로그인 시도 제한, 세션 무효화, sitemap·OG·구조화 데이터, 성능 예산(홈 글꼴 700KB 이하) 포함. 13개 화면의 가로 넘침·24px 미만 조작 요소·axe, 중복 id, 캐러셀 키보드, 필터, 결제·조회, PC 견적, 상담, 회원 가입·로그인, 후기·Q&A·찜, 마이페이지, 더블 클릭 |
| `pnpm --filter shop test:smoke` | 운영 주소를 대상으로 읽기 전용 스모크 테스트 (배포 직후 GitHub Actions가 자동 실행) |
| `pnpm --filter admin test:e2e` | 쇼핑몰과 어드민을 같은 DB로 띄워 데스크톱·모바일 24개. 로그인, 가격 변경 반영, 주문·상담 상태, 문의 답변 반영, 가로 넘침·axe, 데모 초기화 크론 |

- 컴포넌트 테스트는 컴포넌트 옆 `*.test.tsx`에 둡니다 (Vitest + Testing Library, jsdom).
- `src/components.a11y.test.tsx`가 공용 컴포넌트(상품 카드의 할인·품절·상담 상태, 테이프 표지, 상품 그림 91종, 입력 칸과 오류 요약 등)를 렌더링해 axe로 검사합니다. 명도 대비는 jsdom에서 판단할 수 없어 E2E에서 검사합니다.
- Node 26의 실험 기능인 전역 `localStorage`가 jsdom 저장소를 가리므로, Vitest는 `--no-experimental-webstorage`로 실행합니다 (`vitest.config.mts`).
- E2E는 먼저 `pnpm build`로 두 앱을 빌드해 둡니다. 다시 빌드할 때는 예전 서버를 끄고 `.next`를 지웁니다. 서버가 떠 있으면 재생성한 페이지를 새 `.next`에 덮어쓸 수 있습니다.
- Cache Components가 숨겨 둔 화면 때문에 E2E 선택자는 `getByRole`처럼 보이는 요소만 고르는 것을 씁니다.

## 코드 서식

- Prettier 3(`printWidth` 150)로 맞춥니다. `pnpm format`이 고치고, CI는 `pnpm format:check`로 검사합니다. 줄 너비는 기존 코드가 바뀌는 양이 가장 적은 값으로 골랐습니다.
- 마크다운은 Prettier가 표 칸을 맞추느라 원문 한 줄이 지나치게 넓어져 `.prettierignore`로 뺍니다. `pnpm-lock.yaml`과 drizzle 마이그레이션 스냅숏도 생성 파일이라 뺍니다.
- ESLint 설정에는 서식 규칙이 없어 Prettier와 겹치지 않습니다.

## 품질 예산

- **번들 크기:** `pnpm --filter shop size`가 쇼핑몰 전체 JS 400 kB, CSS 92 kB(gzip)를 넘으면 실패합니다. 기준은 `.size-limit.json`에 있습니다.
- **Lighthouse:** `pnpm --filter shop lhci`가 쇼핑몰의 첫 화면·상품 상세·데스크 셋업·PC 견적이 데스크톱 기준 성능 90·접근성 100·권장 사항 95·SEO 90점, LCP 2.5초·TBT 200ms·CLS 0.1 이하인지 3번씩 재서 확인합니다. 기준은 `lighthouserc.json`에 있습니다.
- **접근성 린트:** `eslint-config-next`는 jsx-a11y 규칙을 몇 개만 켭니다. 플러그인은 이미 등록되어 있어 `eslint.config`에서 recommended 규칙만 더해 모두 켭니다. 레이블 글자가 `label > span > span`에 있는 선택지가 있어 `label-has-associated-control`의 찾는 깊이는 3입니다. 홈 캐러셀의 화살표 키·옆 테이프 클릭은 이전·다음 버튼이 키보드 대안이라 그 줄만 예외로 둡니다.

두 검사 모두 프로덕션 빌드가 먼저 있어야 하며, CI는 빌드 뒤에 돌립니다.

## 모니터링

쇼핑몰은 `apps/shop/instrumentation-client.ts`가 화면을 그리기 전에 `_app/monitoring`을 켜고, Sentry와 web-vitals는 나중에 따로 받습니다. Sentry는 페이지를 다 받은 뒤(load) 브라우저가 한가할 때 받고, load가 10초 안에 오지 않으면 그때 바로 받습니다.

| 환경 변수 | 내용 |
| --- | --- |
| `NEXT_PUBLIC_SENTRY_DSN` | 있으면 처리하지 못한 오류와 나쁜(poor) Web Vitals를 Sentry로 보냅니다. 없으면 Sentry를 번들에 넣지 않고, 개발 모드에서 Web Vitals를 콘솔에만 찍습니다 |

- Sentry에는 오류 내용만 보내고 사용자 정보·쿠키·헤더·쿼리 문자열, 방문 기록(세션), 이동·클릭 기록(브레드크럼), 콘솔 기록은 모으지 않습니다. 오류에 붙는 콜백 인수, Error가 아닌 일반 객체로 거부된 Promise의 필드 값(`extra.__serialized__`), 주소의 `#` 뒤도 보내기 전에 지웁니다. Sentry를 받기 전에 난 오류는 20개까지 모아 두었다가 처리되지 않은 오류로 보냅니다.
- 쓰는 함수만 `sentry.ts`에서 다시 내보내 약 31 kB(gzip)로 받습니다. 모듈 전체를 불러오면 리플레이·피드백까지 들어가 140 kB가 됩니다.
- 브라우저 오류만 모읍니다. 서버에서 난 오류는 호스팅(Vercel 등)의 로그로 확인합니다.

## 의존성 갱신 (Dependabot)

`.github/dependabot.yml`이 npm 패키지는 매주 부 버전·패치를 한 PR로 묶어 올리고, 주 버전은 패키지마다 따로 PR을 엽니다. GitHub Actions는 주 버전까지 매달 한 PR로 묶어 올립니다. 주 버전이 든 PR은 변경 내역을 확인하고 CI가 통과할 때만 병합합니다.

다음 주 버전은 받지 않습니다(이유는 설정 파일 주석).

| 패키지 | 머무는 버전 | 이유 |
| --- | --- | --- |
| `typescript` | 5 | typescript-eslint가 TypeScript 7을 지원하지 않음 |
| `eslint` | 9 | eslint-config-next의 eslint-plugin-react·jsx-a11y·import가 9까지만 지원 |
| `@types/node` | 24 | 실행하는 Node 버전(`.nvmrc`)에 맞춤 |
