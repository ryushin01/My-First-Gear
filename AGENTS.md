# My First Gear — 에이전트 작업 안내

이 저장소에서 일하는 에이전트(Codex, Claude Code 등)를 위한 규칙입니다. 자세한 설명은 [개발 가이드](docs/development.md), [배포](docs/deploy.md), [접근성 점검표](docs/accessibility.md), [시퀀스 다이어그램](docs/sequence-diagrams.md)에 있습니다.

## 1. 프로젝트 개요

- 컴퓨터 부품·데스크 셋업부터 오디오·악기·자전거·캠핑까지 첫 장비를 고르는 기어 숍 포트폴리오입니다. PC 견적과 호환성 검사, 모의 결제를 하고, [V](https://github.com/ryushin01/V)와 제품 목록을 매일 주고받습니다. 가격·재고·주문은 모두 가상 데이터입니다.
- 화면 축: 쇼핑몰(`apps/shop`) · 어드민(`apps/admin`).
- 쇼핑몰: https://my-first-gear-ryushin01.vercel.app/ · 어드민: https://my-first-gear-admin-ryushin01.vercel.app/ (데모 비밀번호·회원은 README 참고)

## 2. 기술 스택과 구조

- pnpm 워크스페이스 + Turborepo 모노레포. Next.js 16(App Router, Cache Components), React 19.3, TypeScript, 쇼핑몰 UnoCSS(`presetWind4`), 어드민 Bulma 1, PostgreSQL(Neon, 로컬·테스트는 PGlite), Drizzle ORM, 서버 액션.
- `apps/shop`, `apps/admin` / `packages/catalog`(상품·호환성 검사·V 피드 동기화, 순수 TS), `packages/gear-art`(상품 SVG, 그림 코드는 `@mfg/gear-art/server` 서버 전용), `packages/hooks`(중복 제출 잠금), `packages/db`(스키마·쿼리·마이그레이션·로컬 DB).
- 두 앱은 Feature-Sliced Design v2.1. 층 순서(위가 아래를 가져옴): `_app` → `_pages` → `widgets` → `features` → `entities` → `shared`.
  - Next의 `app/` 라우트는 `_pages`를 다시 내보내기만 합니다.
  - 한 페이지에서만 쓰는 코드는 그 페이지 슬라이스에 두고, 두 곳 이상에서 쓰면 features·widgets로 올립니다.
  - 같은 계층의 교차 가져오기는 `@x` 공개 API로만 합니다. 서버 전용 코드는 `index.server.ts`로 내보냅니다.
  - Steiger를 `pnpm lint` 안에서 돌립니다. `fsd/typo-in-layer-name`만 끕니다.

## 3. 설치·개발 명령

- Node.js 24(`.nvmrc`), pnpm 12(`packageManager: pnpm@12.16.1`).

```bash
nvm use
corepack enable pnpm
pnpm install
pnpm dev                      # 로컬 DB(PGlite) 하나로 쇼핑몰 http://localhost:3000 · 어드민 http://localhost:3001
pnpm build && pnpm start      # 프로덕션 빌드를 같은 방식으로
pnpm --filter shop dev:db     # 앱 하나만(로컬 DB + 쇼핑몰)
pnpm --filter admin dev:db    # 같은 DB 폴더로 어드민만
```

- 루트 `pnpm dev`·`pnpm start`(`packages/db/scripts/local-stack.mjs`)는 `MFG_DATABASE_URL`·`DATABASE_URL`이 없으면 PGlite(`apps/shop/.local-db`)를 띄워 마이그레이션·시드를 적용하고 두 앱에 같은 DB와 캐시 갱신 값을 넘깁니다. `.env`·인터넷 없이 쇼핑몰과 어드민이 시드 데이터로 뜹니다. 포트는 `MFG_SHOP_PORT`·`MFG_ADMIN_PORT`, turbo로 두 앱 `dev`만 띄우려면 `pnpm dev:turbo`.
- PGlite 폴더는 한 프로세스만 열 수 있어 루트 `pnpm dev`와 앱별 `dev:db`를 함께 띄우지 않습니다.
- 쇼핑몰 글꼴은 `next/font/google`이라 **빌드할 때만** 인터넷이 필요합니다(화면은 인터넷 없이 됨).
- DB 없이 `pnpm --filter shop dev`만 돌려도 화면은 뜨지만 주문·조회·상담은 "서버에 연결할 수 없습니다"로 안내합니다.
- 스키마를 바꾸면 `pnpm --filter @mfg/db db:generate`로 새 마이그레이션을 만들어 커밋합니다.
- README 화면: 먼저 `pnpm build`, 그다음 `pnpm --filter admin screenshots`.
- 환경 변수(이름만, `apps/*/.env.example`·[배포](docs/deploy.md)): `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `MFG_DATABASE_URL`, `MFG_SESSION_SECRET`, `MFG_REVALIDATE_SECRET`, `MFG_SHOP_URL`, `MFG_ADMIN_SECRET`(Vercel에서만 필수, 로컬은 로컬 전용 값), `MFG_ADMIN_PASSWORD`, `MFG_DEMO_RESET`, `MFG_MIGRATE_ON_PREVIEW`, `CRON_SECRET`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SENTRY_DSN`.

## 4. 검사·테스트 명령

CI(`.github/workflows/ci.yml`)가 푸시와 PR마다 도는 순서입니다. PR 전에 로컬에서도 돌립니다.

```bash
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint                 # ESLint(turbo) + Steiger(shop, admin)
pnpm typecheck
pnpm test                 # 컴포넌트·접근성·호환성·PGlite 통합 테스트
pnpm build
pnpm --filter shop exec playwright install --with-deps chromium
CI=1 pnpm --filter shop test:e2e
CI=1 pnpm --filter admin test:e2e   # 어드민 + 쇼핑몰, 외부 요청을 막는 e2e/offline.spec.ts 포함
pnpm --filter shop size             # 전체 JS·CSS 예산(.size-limit.json)
pnpm --filter shop lhci             # Lighthouse(lighthouserc.json)
```

- `pnpm --filter shop test:smoke`는 운영 주소를 읽기 전용으로 검사합니다. 운영 배포가 끝나면 `.github/workflows/smoke.yml`이 자동으로 돌립니다.
- E2E를 다시 돌릴 때는 예전 서버를 끄고 `.next`를 지운 뒤 빌드합니다.
- **Testing Library 원칙**: 구현 세부가 아니라 사용자가 보는 동작을 검사하고, 요소는 역할·이름(`getByRole`)으로 찾습니다. Cache Components가 숨긴 화면이 DOM에 남으므로 E2E 선택자도 `getByRole`처럼 보이는 요소만 고르는 것을 씁니다. 단위·컴포넌트는 Vitest + Testing Library(`@testing-library/react`, `user-event`, `jest-dom`, jsdom, 컴포넌트 옆 `*.test.tsx`), 화면 흐름은 Playwright E2E, 접근성은 axe(`src/components.a11y.test.tsx`의 `axe-core`, E2E의 `@axe-core/playwright`)로 검사합니다. 명도 대비는 jsdom에서 판단할 수 없어 E2E에서 봅니다.
- Vitest는 `--no-experimental-webstorage`로 돕니다(Node 25 이상에서 켜지는 전역 `localStorage`가 jsdom 저장소를 가림, `apps/*/vitest.config.mts`).
- 버그를 고치면 고치기 전에 실패하는 테스트를 함께 넣습니다.

## 5. 코드 스타일

- **TypeScript strict**(앱·패키지 `tsconfig.json`마다 `strict: true`)를 유지합니다. `any`·`as` 단언·`@ts-ignore`는 피합니다. TypeScript는 typescript-eslint 지원 때문에 5에 머뭅니다(Dependabot 설정).
- 코드 모양은 **Prettier**(`.prettierrc.json`의 `printWidth: 150`)를 따릅니다. 마크다운·`pnpm-lock.yaml`·마이그레이션 스냅숏·`vFeed.ts`는 Prettier에서 뺍니다. ESLint에는 서식 규칙이 없습니다. Biome은 쓰지 않습니다.
- 고정 id를 쓰지 않습니다(Cache Components가 이전 화면을 숨긴 채 남겨 id가 겹침). 클라이언트는 `useId`, 서버 컴포넌트는 화면마다 다른 접두사를 씁니다.
- 중복 제출은 `useSubmitLock`/`useActionFormLock`(`packages/hooks`)의 `useRef` 잠금으로 막습니다.
- 디자인(1.2.0부터 HUD 화면, 글꼴 조합)은 [개발 가이드](docs/development.md#디자인-기준-쇼핑몰)를 따릅니다. 로고는 바꾸지 않습니다.
- 접근성은 **WCAG 2.2와 KWCAG 2.2**를 따르고([접근성 점검표](docs/accessibility.md)), 자동 검사는 eslint-plugin-jsx-a11y(recommended 전체)와 axe(Vitest·Playwright)로 합니다:
  - 네이티브 요소를 먼저 씁니다(`<button type="button">`, `<a href>`, `<dialog>`).
  - 텍스트 대비 4.5:1 이상, 모든 기능은 키보드로 되고 초점 표시를 지우지 않습니다.
  - 조작 요소는 24×24px 이상(헤더 링크 32px, 버튼 44px)이며 E2E가 24px 미만을 검사합니다.
  - 폼은 레이블·필수 표시·도움말·오류를 `aria-describedby`로 잇고, 실패하면 오류 요약으로 초점을 옮기며 입력값을 되살립니다. 화면 전환 없이 바뀌는 안내는 `role="status"`입니다.
  - 움직이는 효과는 하단 "효과" 토글과 `prefers-reduced-motion`으로 멈출 수 있어야 합니다.

## 6. Git·PR

- 흐름은 **GitHub Flow**입니다. `main`에 직접 커밋·푸시하지 않고, 최신 `main`에서 브랜치를 만들어 PR로만 병합합니다. 예외로 `.github/workflows/gear-sync.yml`이 매일 V 카탈로그 동기화(`chore: V 카탈로그 동기화`)를 `main`에 바로 올립니다.
- 브랜치 이름: `feat/…`, `fix/…`, `refactor/…`, `docs/…`, `test/…`, `chore/…`, `release/…`. 기능 브랜치는 `feat/v1.5.0-premium-art`처럼 버전을 넣어 왔습니다.
- 커밋 메시지는 **Conventional Commits**(`<타입>: <한국어 요약>`)입니다. 타입은 `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `style`, `chore`, `ci`, `build`입니다. 실제 예: `feat: 브랜드와 상품 이름에 영어를 함께 적음(영어 병기), 1.4.0`, `fix: 리뷰 반영 — 고대비 모드에서도 ON/OFF 토글의 켜진 칸이 보이게`. 이 저장소는 버전을 `, 1.4.0`처럼 쉼표 뒤에 붙이고, PR 제목은 `1.5.0: 고가 상품 44개 실사풍 그림`처럼 버전을 앞에 적어 왔습니다(표준의 끝 `(x.y.z)`와 다른 점).
- **기여자는 ryushin01만 남깁니다.** 커밋 작성자는 항상 ryushin01(`ryushin0 <141554987+ryushin01@users.noreply.github.com>`)입니다. 이 저장소는 백엔드 코드가 있는 저장소라 공동 작성자 줄은 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` 하나만 넣습니다.
- GitHub Actions가 커밋하는 워크플로는 작성자를 ryushin01로 설정합니다(`github-actions[bot]` 금지). Dependabot PR은 그대로 병합하지 말고 같은 변경을 ryushin01 커밋으로 다시 만들어 병합합니다. 지금 `gear-sync.yml`은 `github-actions[bot]`으로 커밋하므로 이 규칙과 다릅니다(워크플로 수정 필요).
- **Semantic Versioning**(주.부.수): 버전은 루트 `package.json`의 `version`과 README 버전 배지에서 맞춥니다. **Keep a Changelog**를 따라 `CHANGELOG.md`에 `## x.y.z - YYYY-MM-DD` 절을 더하되, 내용은 소제목 없이 요약과 `-` 목록이고 `[Unreleased]` 절은 쓰지 않습니다(표준과 다른 점). 문서만 바뀐 PR은 보통 버전을 올리지 않습니다.
- 병합은 merge commit(`Merge pull request #번호 …`)으로 합니다. 원격 브랜치 삭제는 저장소 설정에 맡깁니다.
- CI가 통과하면 CodeRabbit 리뷰를 기다리지 않고 병합합니다. 이미 달린 지적 중 맞는 것은 반영합니다. Actions가 돌지 않으면 4절의 검사를 로컬에서 통과한 뒤 병합합니다.

## 7. 배포·릴리스

- Vercel 프로젝트 두 개(쇼핑몰 `apps/shop`, 어드민 `apps/admin`, 함수 지역 `sin1`)와 Neon DB 하나. 각 `vercel.json`의 `git.deploymentEnabled`로 `main`만 배포하고 PR 미리보기는 끕니다.
- 쇼핑몰 빌드는 `pnpm --filter @mfg/db db:migrate`로 운영 DB에 마이그레이션을 적용한 뒤 빌드합니다. 문서만 바뀐 커밋도 두 프로젝트가 배포되므로, 사용자가 일괄 배포일을 정하면 그때까지 병합하지 않고 PR만 올려 둡니다(Vercel Hobby 하루 100회는 계정 전체 한도).
- 데모: Vercel Cron이 매일 04:00(KST)에 `/api/cron/reset-demo`로 데모 데이터를 처음 상태로 되돌립니다(`MFG_DEMO_RESET=off`면 끔). 어드민은 `MFG_ADMIN_PASSWORD`가 없으면 공개 데모 비밀번호를 씁니다.
- 운영 배포가 끝나면 `smoke.yml`이 읽기 전용 스모크 테스트를 돌립니다. 배포 뒤 두 주소가 200인지도 확인합니다.
- 릴리스: 병합 뒤 `vX.Y.Z` 태그와 같은 이름의 GitHub 릴리스(대상은 병합 커밋 전체 SHA, 본문은 `CHANGELOG.md`의 해당 절)를 만듭니다.
- 릴리스 뒤 `bash ~/Documents/Archive/Backup/backup.sh`를 돌려 DONE을 확인합니다.
- 보관함 계획 문서 `~/Documents/Obsidian Vault/My-First-Gear v1.0.0 고도화 계획.md`에 날짜와 진행 기록을 남깁니다.
- 소개가 크게 바뀌면 프로필 저장소 `ryushin01/ryushin01` README의 프로젝트 표를 고칩니다(버전 숫자는 자동 갱신).

## 8. 보안·주의사항

- **상태는 명령 결과로만 말합니다.** CI·배포·릴리스가 "통과했다", "끝났다"는 실제 명령 결과(`gh pr checks`, Vercel 배포 상태, 주소 응답 코드)로 확인한 뒤에 말합니다.
- **먼저 묻기:** 새 런타임 의존성 추가, 빌드 설정(`next.config.ts`, `vercel.json`, `turbo.json`) 변경, 운영 DB에 닿는 마이그레이션.
- **절대 금지:** 비밀값을 `NEXT_PUBLIC_*`에 넣기, `.env*` 커밋, `eslint-disable`·`--no-verify`로 검사 우회, `main`에 직접 푸시(동기화 워크플로 예외).
- 비밀값과 `.env.local`, `.local-db`를 커밋하지 않습니다. 비밀은 Vercel에 Sensitive로 넣습니다. `MFG_REVALIDATE_SECRET`은 두 앱이 같아야 합니다.
- **마이그레이션 규칙**: 이미 적용된 마이그레이션은 고치거나 지우지 않고 새 파일로 더합니다. 운영 DB에 `drizzle-kit push`를 쓰지 않습니다.
- DB 연결은 운영 환경에만 있습니다. 미리보기에서 DB가 필요하면 Neon 프리뷰 브랜치와 `MFG_MIGRATE_ON_PREVIEW=1`을 씁니다.
- 보안 헤더(CSP `frame-ancestors` 등, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`)는 두 앱의 `next.config.ts`에서 유지합니다. 어드민은 `noindex`입니다.
- Sentry에는 사용자 정보·쿠키·헤더·쿼리 문자열을 보내지 않습니다. 문자·메일 발송처럼 비용이 드는 기능은 넣지 않습니다.
- 상품 그림은 실제 제품을 보고 직접 그린 SVG이며 로고·상표 문양을 넣지 않습니다. 참고 사이트의 자료는 가져오지 않습니다.
- V 피드(`packages/catalog/src/sync/vFeed.ts`)는 매일 동기화 워크플로가 고쳐 `main`에 올리는 파일입니다(Prettier에서도 뺌). 같은 파일을 고치는 PR은 동기화 커밋과 겹칠 수 있습니다.

## 9. 공통 규칙

규칙은 3계층입니다. 1층 전역(`~/.claude/CLAUDE.md`, OpenCode는 `~/.config/opencode/AGENTS.md`로 같은 파일) → 2층 ryushin01 공통(`~/Documents/GitHub/CLAUDE.md`, Claude Code만 읽음) → 3층 이 파일. 충돌하면 이 파일이 우선합니다. 2층을 읽지 못하는 도구를 위해 핵심을 아래에 요약합니다.

- 답변·커밋·PR·문서·주석은 한국어로 씁니다.
- 허락을 묻지 않고 끝까지 진행한 뒤 결과를 한 번에 보고합니다. 비용이 드는 일·비밀값 생성·디자인 변경·되돌리기 어려운 일·다른 조직 저장소에 공개로 글 올리기는 진행 전에 보고하고 결정을 받습니다.
- 사용자의 진행 중인 작업을 보호합니다. 로컬 작업 트리에 변경이 있으면 `git worktree add /tmp/<이름> -b <브랜치> origin/main`에서 작업하고 끝나면 지웁니다.
- 다른 세션에 공지할 때는 Paseo의 ryushin01 그룹 세션에만 보냅니다.
