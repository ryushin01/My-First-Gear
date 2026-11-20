#!/usr/bin/env node
// V 셋업 배치도의 실제 모델 목록(/feed/gear.json)을 받아 src/sync/vFeed.ts로 저장한다.
// 쇼핑몰은 이 파일에서 자기에게 없는 제품만 상품으로 만든다(src/sync/fromV.ts).
//
//   node packages/catalog/scripts/sync-v-feed.mjs              V 운영 사이트에서 받는다
//   node packages/catalog/scripts/sync-v-feed.mjs --from a.json  파일에서 읽는다
//
// 받은 값은 정해 둔 필드만 골라 검사한다. 하나라도 어긋나면 파일을 바꾸지 않고 실패한다.
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const FEED_URL = process.env.V_FEED_URL ?? "https://v-setup-planner-ryushin01.vercel.app/feed/gear.json";
const OUT = fileURLToPath(new URL("../src/sync/vFeed.ts", import.meta.url));

const ID = /^[a-z0-9][a-z0-9-]{0,99}$/;
const WORD = /^[a-z][a-z-]{0,39}$/;

function text(value, field) {
  if (typeof value !== "string" || value.trim() === "" || value.length > 200) throw new Error(`${field}: 1~200자 문자열이 아닙니다`);
  return value;
}

function number(value, field, min, max) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max)
    throw new Error(`${field}: ${min}~${max} 사이 숫자가 아닙니다`);
  return value;
}

function pattern(value, field, re) {
  if (typeof value !== "string" || !re.test(value)) throw new Error(`${field}: 형식이 맞지 않습니다 (${JSON.stringify(value)})`);
  return value;
}

/** 정해 둔 필드만 골라 새 객체를 만든다. 모르는 필드는 버린다. */
function item(raw, index) {
  const at = `items[${index}]`;
  if (!raw || typeof raw !== "object") throw new Error(`${at}: 객체가 아닙니다`);
  const out = {
    id: pattern(raw.id, `${at}.id`, ID),
    name: text(raw.name, `${at}.name`),
    brand: text(raw.brand, `${at}.brand`),
    kind: pattern(raw.kind, `${at}.kind`, WORD),
    category: pattern(raw.category, `${at}.category`, WORD),
    layer: pattern(raw.layer, `${at}.layer`, WORD),
    width: number(raw.width, `${at}.width`, 0.1, 1000),
    depth: number(raw.depth, `${at}.depth`, 0.1, 1000),
    watts: number(raw.watts, `${at}.watts`, 0, 10000),
  };
  if (raw.wattsBasis !== undefined) out.wattsBasis = pattern(raw.wattsBasis, `${at}.wattsBasis`, WORD);
  out.cable = number(raw.cable, `${at}.cable`, 0, 10000);
  if (raw.diagonalInch !== undefined) out.diagonalInch = number(raw.diagonalInch, `${at}.diagonalInch`, 1, 200);
  if (raw.ports !== undefined) out.ports = number(raw.ports, `${at}.ports`, 0, 100);
  if (raw.dimsBasis !== undefined) {
    if (raw.dimsBasis !== "estimate") throw new Error(`${at}.dimsBasis: "estimate"만 받습니다`);
    out.dimsBasis = "estimate";
  }
  return out;
}

export function parseFeed(raw) {
  if (!raw || typeof raw !== "object") throw new Error("피드가 객체가 아닙니다");
  if (raw.version !== 1) throw new Error(`모르는 피드 버전입니다: ${raw.version}`);
  if (raw.source !== "v") throw new Error(`V 피드가 아닙니다: ${raw.source}`);
  if (!Array.isArray(raw.items) || raw.items.length === 0 || raw.items.length > 5000) throw new Error("items는 1~5000개여야 합니다");
  const items = raw.items.map(item);
  const seen = new Set();
  for (const { id } of items) {
    if (seen.has(id)) throw new Error(`id가 겹칩니다: ${id}`);
    seen.add(id);
  }
  return { version: 1, source: "v", items };
}

async function load() {
  const from = process.argv.indexOf("--from");
  if (from !== -1) return JSON.parse(await readFile(process.argv[from + 1], "utf8"));
  const res = await fetch(FEED_URL, { signal: AbortSignal.timeout(20_000), headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`V 피드를 받지 못했습니다: HTTP ${res.status}`);
  return res.json();
}

const HEADER = `// 자동 생성 파일. packages/catalog/scripts/sync-v-feed.mjs가 V 배치도의 /feed/gear.json에서 받아 쓴다. 손으로 고치지 않는다.
import type { PlannerFeed } from "./feeds";

export const vFeed: PlannerFeed = `;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const feed = parseFeed(await load());
    const next = `${HEADER}${JSON.stringify(feed, null, 2)};\n`;
    const prev = await readFile(OUT, "utf8").catch(() => "");
    if (prev === next) {
      console.log(`V 피드 그대로: 모델 ${feed.items.length}개`);
    } else {
      await writeFile(OUT, next);
      console.log(`V 피드 갱신: 모델 ${feed.items.length}개 → ${OUT}`);
    }
  } catch (error) {
    console.error(`V 피드 동기화 실패: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}
