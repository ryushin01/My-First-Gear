# 배포

쇼핑몰과 어드민을 **Vercel 프로젝트 두 개**로 배포합니다. DB는 Vercel Marketplace로 연결한 **Neon(Postgres)** 하나를 함께 씁니다.

- **지역:** Neon 연동에서 고를 수 있는 지역 중 한국에서 가장 가까운 싱가포르(`sin1`)에 DB를 두고, 두 앱의 함수도 같은 지역에서 실행합니다(`vercel.json`의 `regions`). DB와 함수가 멀면 쿼리마다 왕복 시간이 쌓이므로 둘을 함께 옮깁니다.
- **프리뷰 배포:** DB 연결은 운영 환경에만 두었습니다. 프리뷰 배포는 운영 데이터를 건드리지 않고, 쇼핑몰은 코드의 기본 카탈로그로 화면만 보여 줍니다(주문·회원 기능은 "서버에 연결할 수 없음"으로 안내). 프리뷰에서도 DB가 필요하면 Neon 콘솔의 Vercel 연동 설정에서 프리뷰 브랜치를 켜고 `MFG_MIGRATE_ON_PREVIEW=1`을 넣습니다.

> Vercel Hobby 요금제와 Neon 무료 요금제의 한도(빌드 시간, DB 용량·컴퓨트 시간, 크론 횟수)는 바뀔 수 있으니 공식 문서에서 확인하세요.

## 1. 쇼핑몰 프로젝트

| 설정 | 값 |
|---|---|
| Root Directory | `apps/shop` (루트 밖 파일 포함 켜기, 기본값) |
| Framework | Next.js |
| 설정 파일 | `apps/shop/vercel.json` (설치·빌드 명령, 크론) |

- 빌드 명령은 `packages/db/scripts/migrate.mjs`로 Drizzle 마이그레이션(테이블, 상품 판매 정보·데모 회원·후기 시드)을 적용한 뒤 앱을 빌드합니다. 마이그레이션은 풀러를 거치지 않는 `DATABASE_URL_UNPOOLED`로 적용합니다.
- 프리뷰 배포에서는 마이그레이션을 건너뜁니다. Neon 연동에서 프리뷰마다 DB 브랜치를 만들도록 켰다면 `MFG_MIGRATE_ON_PREVIEW=1`을 프리뷰 환경 변수에 넣습니다.
- Vercel Cron이 매일 04:00(KST, `0 19 * * *` UTC)에 `/api/cron/reset-demo`를 부릅니다. 주문·상담·회원(후기·문의·찜·견적 포함)을 지우고, 판매 정보와 데모 회원·후기·질문을 시드 값으로 되돌린 뒤 캐시를 비웁니다. Vercel이 보내는 `Authorization: Bearer $CRON_SECRET`이 맞을 때만 실행합니다.

환경 변수:

| 이름 | 값 |
|---|---|
| `DATABASE_URL`, `DATABASE_URL_UNPOOLED` | Neon 연동이 운영 환경에 자동으로 넣음 |
| `MFG_SESSION_SECRET` | 회원 세션 서명용 임의의 긴 문자열 (Sensitive) |
| `MFG_REVALIDATE_SECRET` | 캐시 갱신 엔드포인트 비밀 값 (어드민과 같게) |
| `CRON_SECRET` | 크론 호출 확인용 임의의 긴 문자열 |
| `NEXT_PUBLIC_SITE_URL` | 운영 주소 `https://my-first-gear-ryushin01.vercel.app`. 없으면 Vercel이 고른 운영 주소를 쓰는데, 주소가 여럿이면 짧은 옛 주소가 골라질 수 있어 지정합니다. |

## 2. 어드민 프로젝트

| 설정 | 값 |
|---|---|
| Root Directory | `apps/admin` |
| Framework | Next.js |
| 설정 파일 | `apps/admin/vercel.json` |

환경 변수 (모두 Sensitive):

| 이름 | 값 |
|---|---|
| `DATABASE_URL` | 쇼핑몰과 같은 Neon DB (같은 Neon 연동을 어드민 프로젝트에도 연결) |
| `MFG_SHOP_URL` | 쇼핑몰 주소 (예: `https://my-first-gear-ryushin01.vercel.app`) |
| `MFG_REVALIDATE_SECRET` | 쇼핑몰과 같은 값 |
| `MFG_ADMIN_SECRET` | 세션 서명용 임의의 긴 문자열 |
| `MFG_ADMIN_PASSWORD` | 선택. 비우면 공개 데모 비밀번호 `demo-admin` |

어드민은 `X-Robots-Tag: noindex` 헤더(`next.config.ts`)와 `robots` 메타로 검색에 노출하지 않습니다.

## 마이그레이션 규칙

- 스키마를 바꾼 뒤 `pnpm --filter @mfg/db db:generate`로 `packages/db/migrations`에 새 파일을 만들고 커밋합니다. 운영 배포가 적용합니다.
- 이미 적용된 마이그레이션은 고치거나 지우지 않습니다. 고칠 내용은 새 마이그레이션으로 추가합니다.
- 운영 DB에 `drizzle-kit push`를 쓰지 않습니다.

## CI

`.github/workflows/ci.yml`이 push와 PR마다 다음을 실행합니다.

1. `pnpm lint` (ESLint + steiger FSD 검사)
2. `pnpm typecheck`
3. `pnpm test` (컴포넌트·접근성·호환성 테스트, 로컬 Postgres(PGlite) 통합 테스트)
4. `pnpm build`
5. 쇼핑몰 E2E, 어드민 + 쇼핑몰 E2E (실패하면 결과를 아티팩트로 올림)

`.github/workflows/smoke.yml`은 Vercel이 운영 배포를 마치고 보내는 `repository_dispatch`(`vercel.deployment.success`) 이벤트에 맞춰(프로젝트 Git 설정에서 저장소 이벤트를 켜 둠), 운영 주소를 대상으로 읽기 전용 스모크 테스트(`apps/shop/smoke`)를 돌립니다. 주요 화면 응답, DB 연결(시드 후기), sitemap·robots·OG 이미지, 크론 거절, 어드민 `noindex`를 확인합니다. Actions 탭에서 직접 실행할 수도 있습니다.

## PR 미리보기 배포

Vercel의 하루 배포 한도를 아끼려고 PR 미리보기 배포를 껐습니다(`vercel.json`의 `git.deploymentEnabled`). `main`에 머지할 때만 운영으로 배포하고, PR에서는 CI 검사만 돕니다. 미리보기가 꼭 필요하면 그 브랜치를 `deploymentEnabled`에 잠시 넣습니다.
