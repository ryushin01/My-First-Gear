# 배포

쇼핑몰과 어드민을 Netlify의 **두 사이트**로 배포합니다. DB는 쇼핑몰 사이트의 Netlify Database 하나를 함께 씁니다.

> Netlify Database는 크레딧 기반 요금제에서만 쓸 수 있고, 쓰는 만큼 크레딧이 듭니다. 배포 전에 팀 요금제를 확인하세요.

## 1. 쇼핑몰 사이트

| 설정 | 값 |
|---|---|
| Base directory | (비움, 저장소 루트) |
| Package directory | `apps/shop` |
| 설정 파일 | `apps/shop/netlify.toml` (빌드 명령, publish, 함수 폴더) |

- `@netlify/database`가 의존성에 있으므로 첫 배포 때 DB가 만들어지고, `apps/shop/netlify/database/migrations`의 마이그레이션(테이블 생성, 상품 판매 정보 시드)이 배포 직전에 적용됩니다.
- Deploy Preview마다 DB 브랜치가 생깁니다. 프리뷰 링크는 공개되므로 운영 데이터가 섞이지 않게 주의하세요.
- 예약 함수 `reset-demo`가 매일 04:00(KST)에 주문·상담을 지우고 판매 정보를 시드 값으로 되돌립니다.

환경 변수:

| 이름 | 값 |
|---|---|
| `MFG_REVALIDATE_SECRET` | 임의의 긴 문자열 (어드민과 같게) |

## 2. 어드민 사이트

| 설정 | 값 |
|---|---|
| Base directory | (비움) |
| Package directory | `apps/admin` |
| 설정 파일 | `apps/admin/netlify.toml` |

환경 변수 (모두 Secret으로 표시):

| 이름 | 값 |
|---|---|
| `MFG_DATABASE_URL` | 쇼핑몰 사이트 DB 연결 문자열 (`netlify database status --show-credentials`로 확인) |
| `MFG_SHOP_URL` | 쇼핑몰 주소 (예: `https://my-first-gear.netlify.app`) |
| `MFG_REVALIDATE_SECRET` | 쇼핑몰과 같은 값 |
| `MFG_ADMIN_SECRET` | 세션 서명용 임의의 긴 문자열 |
| `MFG_ADMIN_PASSWORD` | 선택. 비우면 공개 데모 비밀번호 `demo-admin` |

어드민은 `X-Robots-Tag: noindex`와 `robots` 메타로 검색에 노출하지 않습니다.

## 마이그레이션 규칙

- 스키마를 바꾼 뒤 `pnpm --filter @mfg/db db:generate`로 새 파일을 만들고 커밋합니다. 배포가 적용합니다.
- 이미 적용된 마이그레이션은 고치거나 지우지 않습니다. 고칠 내용은 새 마이그레이션으로 추가합니다.
- 호스팅 DB에 `drizzle-kit push`나 `migrate`를 직접 실행하지 않습니다.

## CI

`.github/workflows/ci.yml`이 push와 PR마다 다음을 실행합니다.

1. `pnpm lint` (ESLint + steiger FSD 검사)
2. `pnpm typecheck`
3. `pnpm test` (단위 + 로컬 Postgres 통합 테스트)
4. `pnpm build`, Storybook 빌드
5. 쇼핑몰 E2E, 어드민 + 쇼핑몰 E2E (실패하면 결과를 아티팩트로 올림)
