import { getCategory } from "../categories";
import type { ArtKind, CategoryId, PartCompat, Product, Spec } from "../types";
import { vAliases } from "./aliases";
import type { PlannerFeed, PlannerFeedItem } from "./feeds";
import { fallbackPrices, vPrices } from "./vPrices";

/** V 물건 종류 → 쇼핑몰 카테고리. 표에 없는 종류는 가져오지 않는다. */
const KIND_CATEGORY: Readonly<Record<string, CategoryId>> = {
  desk: "desk",
  stand: "furniture",
  chair: "chair",
  sofa: "furniture",
  monitor: "monitor",
  tv: "electronics",
  pc: "desktop",
  console: "console",
  laptop: "laptop",
  keyboard: "keyboard",
  mouse: "mouse",
  mousepad: "desk-accessory",
  palmrest: "desk-accessory",
  lightbar: "lighting",
  arm: "monitor-arm",
  footrest: "furniture",
  headphones: "headphone",
  earphones: "earphone",
  "audio-device": "amp-dac",
  handheld: "electronics",
  holder: "desk-accessory",
  hub: "electronics",
  decor: "desk-accessory",
  shelf: "furniture",
  lamp: "lighting",
  speaker: "speaker",
  subwoofer: "speaker",
  soundbar: "speaker",
  receiver: "amp-dac",
  outlet: "desk-accessory",
  strip: "desk-accessory",
};

/** V 물건 종류 → 상품 그림 */
const KIND_ART: Readonly<Record<string, ArtKind>> = {
  desk: "desk",
  stand: "shelf",
  chair: "chair",
  sofa: "chair",
  monitor: "monitor",
  tv: "tv",
  pc: "case",
  console: "console",
  laptop: "laptop",
  keyboard: "keyboard",
  mouse: "mouse",
  mousepad: "accessory",
  palmrest: "accessory",
  lightbar: "lamp",
  arm: "monitor-arm",
  footrest: "shelf",
  headphones: "headphone",
  earphones: "earphone",
  "audio-device": "amp",
  handheld: "tablet",
  holder: "accessory",
  hub: "amp",
  decor: "accessory",
  shelf: "shelf",
  lamp: "lamp",
  speaker: "speaker",
  subwoofer: "speaker",
  soundbar: "speaker",
  receiver: "amp",
  outlet: "accessory",
  strip: "accessory",
};

/** 종류만으로는 카테고리가 어긋나는 모델 */
const CATEGORY_OVERRIDES: Readonly<Record<string, CategoryId>> = {
  "lian-li-o11-dynamic-evo": "case",
  "nzxt-h9-flow": "case",
  "apple-imac-24": "desktop",
  "astell-kern-ak120": "dap",
  "cowon-plenue-v": "dap",
  "sony-icf-506": "electronics",
  "8bitdo-micro": "console",
};

/** PC 견적에서 호환성을 따질 수 있게 케이스 값을 더한다. */
const COMPAT_OVERRIDES: Readonly<Record<string, PartCompat>> = {
  "lian-li-o11-dynamic-evo": {
    part: "case",
    boards: ["E-ATX", "ATX", "mATX", "ITX"],
    maxGpuLengthMm: 422,
    maxCoolerHeightMm: 167,
    maxGpuSlots: 4,
    psuFormFactors: ["ATX"],
  },
  "nzxt-h9-flow": {
    part: "case",
    boards: ["E-ATX", "ATX", "mATX", "ITX"],
    maxGpuLengthMm: 435,
    maxCoolerHeightMm: 165,
    maxGpuSlots: 4,
    psuFormFactors: ["ATX"],
  },
};

const WATTS_BASIS: Readonly<Record<string, string>> = {
  max: "최대",
  typical: "평소",
  rated: "정격",
  listed: "제조사 표기",
  psu: "전원부 정격",
  adapter: "어댑터 정격",
  measured: "실측",
  estimate: "추정",
  default: "기본값",
};

/**
 * 표에서 자기 속성만 읽는다. 피드 값이 "constructor"처럼 객체가 물려받은 이름이어도
 * 상속 값을 돌려주지 않아, 이상한 피드 한 줄이 카탈로그 전체를 멈추지 않는다.
 */
const own = <T>(table: Readonly<Record<string, T>>, key: string | undefined): T | undefined =>
  key !== undefined && Object.hasOwn(table, key) ? table[key] : undefined;

const PALETTE = ["#ff3131", "#7b3fe4", "#1a9fff", "#e8a33d", "#2fbf71", "#e84393", "#9aa4b1", "#ff7a00"];

/** 짝으로 놓는 스피커처럼 한 상품을 V가 둘로 나눠 둔 모델 */
const PAIR = /-(active|passive|primary|secondary|left|right)$/;
const SUB = "-sub";

/** 같은 입력에는 늘 같은 값을 주는 32비트 해시 (FNV-1a) */
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

const num = (value: number) => String(Math.round(value * 10) / 10);

/** 배치도에서만 뜻이 있는 말을 상품 이름에서 뺀다. */
function cleanName(name: string): string {
  return name.replace(/\s*\((세워 둠|독에 꽂은 상태|케이스)\)/g, "").trim();
}

function pairName(name: string): string {
  const base = name
    .replace(/\s*\((오른쪽|왼쪽|주 스피커|보조 스피커)[^)]*\)/g, "")
    .replace(/(액티브|패시브)\s*/g, "")
    .trim();
  return `${base} (한 쌍)`;
}

/** 쇼핑몰에 이미 있는 제품의 V 모델 id: slug가 같거나 별칭 표에 있는 것 */
function knownVIds(native: readonly Product[]): Set<string> {
  const ids = new Set<string>();
  for (const product of native) {
    ids.add(product.slug);
    for (const alias of vAliases[product.slug] ?? []) ids.add(alias);
  }
  return ids;
}

/** V 모델을 상품 단위로 묶는다. 스피커 한 쌍, 사운드바와 서브우퍼는 한 상품이다. */
function groupModels(items: readonly PlannerFeedItem[]): Map<string, PlannerFeedItem[]> {
  const ids = new Set(items.map((item) => item.id));
  const groups = new Map<string, PlannerFeedItem[]>();
  for (const item of items) {
    let base = item.id;
    if (PAIR.test(item.id)) base = item.id.replace(PAIR, "");
    else if (item.id.endsWith(SUB) && ids.has(item.id.slice(0, -SUB.length))) base = item.id.slice(0, -SUB.length);
    groups.set(base, [...(groups.get(base) ?? []), item]);
  }
  return groups;
}

function specsOf(main: PlannerFeedItem, group: readonly PlannerFeedItem[], watts: number, estimate: boolean): Spec[] {
  const specs: Spec[] = [
    {
      label: "놓는 자리",
      value: `가로 ${num(main.width)} × 세로 ${num(main.depth)}cm${group.length > 1 ? " (한 개)" : ""}${estimate ? ", 추정" : ""}`,
    },
  ];
  if (watts > 0) {
    const basis = own(WATTS_BASIS, main.wattsBasis);
    specs.push({ label: "소비 전력", value: `${num(watts)}W${basis ? ` (${basis})` : ""}` });
  } else if (main.wattsBasis === "usb") {
    specs.push({ label: "전원", value: "USB 전원" });
  }
  if (main.cable > 0) specs.push({ label: "전원 케이블", value: `${num(main.cable)}cm` });
  if (main.diagonalInch) specs.push({ label: "화면 크기", value: `${num(main.diagonalInch)}인치` });
  if (main.ports) specs.push({ label: "콘센트", value: `${main.ports}구` });
  specs.push({ label: "출처", value: "V 셋업 배치도 실제 모델" });
  return specs;
}

/**
 * V 피드에서 쇼핑몰에 없는 제품만 상품으로 만든다.
 * 가격·재고·평점은 다른 상품처럼 지어낸 값이고, 같은 모델에는 늘 같은 값이 나온다.
 */
export function productsFromV(feed: PlannerFeed, native: readonly Product[]): Product[] {
  const known = knownVIds(native);
  const result: Product[] = [];

  for (const [slug, group] of groupModels(feed.items)) {
    if (known.has(slug) || group.some((item) => known.has(item.id))) continue;
    const main = group.find((item) => item.id === slug) ?? [...group].sort((a, b) => b.watts - a.watts)[0];
    const categoryId = own(CATEGORY_OVERRIDES, main.id) ?? own(KIND_CATEGORY, main.kind);
    if (!categoryId) continue;

    const isPair = group.length > 1 && group.every((item) => PAIR.test(item.id));
    const withSub = group.length > 1 && !isPair;
    const raw = isPair ? pairName(main.name) : `${cleanName(main.name)}${withSub ? " (서브우퍼 포함)" : ""}`;
    const name = raw.startsWith(main.brand) ? raw : `${main.brand} ${raw}`;
    const watts = group.reduce((sum, item) => sum + item.watts, 0);
    const estimate = group.some((item) => item.dimsBasis === "estimate");
    const h = hash(slug);
    const art: ArtKind = categoryId === "dap" ? "dap" : (own(KIND_ART, main.kind) ?? "accessory");
    const compat = own(COMPAT_OVERRIDES, main.id);

    result.push({
      id: `p-v-${slug}`,
      slug,
      name,
      brand: main.brand,
      categoryId,
      price: own(vPrices, slug) ?? own(fallbackPrices, categoryId) ?? 99_000,
      stock: 3 + (h % 38),
      purchaseMode: "cart",
      art: { kind: art, accent: PALETTE[h % PALETTE.length], model: slug },
      tagline: `V 배치도에서 온 ${getCategory(categoryId).name}`,
      description: `${name}입니다. V 셋업 배치도의 실제 모델 카탈로그에서 가져온 상품이라 놓는 자리와 소비 전력을 V의 값으로 보여 줍니다.${
        estimate ? " 치수는 제조사 값을 찾지 못해 비슷한 제품으로 추정했습니다." : ""
      }`,
      specs: specsOf(main, group, watts, estimate),
      ...(compat ? { compat } : {}),
      rating: (43 + ((h >>> 8) % 7)) / 10,
      reviewCount: 4 + ((h >>> 12) % 240),
      salesRank: 300 + result.length,
      footprint: { widthCm: main.width, depthCm: main.depth },
      vModelId: main.id,
      source: "v",
    });
  }
  return result;
}

/** 쇼핑몰 상품 가운데 V에도 있는 것에 V 모델 id를 단다. 상품 화면이 V로 이어 준다. */
export function linkToV(native: readonly Product[], feed: PlannerFeed): Product[] {
  const ids = new Set(feed.items.map((item) => item.id));
  return native.map((product) => {
    const vModelId = ids.has(product.slug) ? product.slug : vAliases[product.slug]?.find((alias) => ids.has(alias));
    return vModelId ? { ...product, vModelId } : product;
  });
}
