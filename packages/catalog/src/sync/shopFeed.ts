import { nativeProducts } from "../products";
import { deskSpecs, monitorSizes } from "../setup";
import type { Product } from "../types";
import { vAliases } from "./aliases";
import type { ShopFeed, ShopFeedItem } from "./feeds";

const specValue = (product: Product, label: string) => product.specs.find((spec) => spec.label === label)?.value;

function feedItem(product: Product): ShopFeedItem {
  const monitor = monitorSizes[product.slug];
  const desk = deskSpecs[product.slug];
  const size = product.categoryId === "monitor" ? specValue(product, "크기") : undefined;
  const inch = monitor?.inch ?? (size ? Number(/(\d+(?:\.\d+)?)인치/.exec(size)?.[1]) || undefined : undefined);
  const aspect = size ? /(\d+):9/.exec(size)?.[0] : undefined;
  const widthCm = product.footprint?.widthCm ?? (monitor ? monitor.widthMm / 10 : desk ? desk.widthMm / 10 : undefined);
  const aliases = vAliases[product.slug];
  const layout = product.categoryId === "keyboard" ? specValue(product, "배열") : undefined;
  return {
    id: product.slug,
    name: product.name,
    brand: product.brand,
    category: product.categoryId,
    price: product.price,
    ...(aliases ? { aliases: [...aliases] } : {}),
    ...(widthCm ? { widthCm } : {}),
    ...(product.footprint ? { depthCm: product.footprint.depthCm } : {}),
    ...(inch ? { diagonalInch: inch } : {}),
    ...(aspect ? { aspect } : {}),
    ...(layout ? { layout } : {}),
  };
}

/**
 * V 배치도에 넘기는 상품 목록. 이 쇼핑몰이 직접 올린 상품만 싣는다(V에서 가져온 상품은 V로 되돌려 보내지 않는다).
 * /feed/gear.json으로 공개한다.
 */
export function shopFeed(source: readonly Product[] = nativeProducts): ShopFeed {
  return { version: 1, source: "my-first-gear", items: source.filter((product) => product.source !== "v").map(feedItem) };
}
