"use server";

import { revalidatePath } from "next/cache";
import { getProductById } from "@mfg/catalog";
import { getDb, updateMerch } from "@mfg/db";
import { revalidateShop } from "@/shared/api";
import type { ActionState } from "@/shared/ui";

function toInt(value: FormDataEntryValue | null): number | null {
  const text = String(value ?? "").replaceAll(",", "").trim();
  if (text === "") return null;
  const n = Number(text);
  return Number.isInteger(n) && n >= 0 ? n : NaN;
}

export async function updateMerchAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const productId = String(formData.get("productId") ?? "");
  const product = getProductById(productId);
  if (!product) return { ok: false, message: "상품을 찾지 못했습니다." };

  const values = Object.fromEntries(["price", "listPrice", "stock", "featured", "visible"].map((k) => [k, String(formData.get(k) ?? "")]));
  const fail = (message: string): ActionState => ({ ok: false, message, values });
  const price = toInt(formData.get("price"));
  const listPrice = toInt(formData.get("listPrice"));
  const stock = toInt(formData.get("stock"));
  if (price === null || Number.isNaN(price) || price === 0) return fail(`${product.name}: 판매가는 1원 이상 정수로 입력해 주세요.`);
  if (Number.isNaN(listPrice)) return fail(`${product.name}: 정가는 비우거나 정수로 입력해 주세요.`);
  if (listPrice !== null && listPrice <= price) return fail(`${product.name}: 정가는 판매가보다 커야 합니다. 할인이 없으면 비워 두세요.`);
  if (stock === null || Number.isNaN(stock)) return fail(`${product.name}: 재고는 0 이상 정수로 입력해 주세요.`);

  await updateMerch(getDb(), productId, {
    price,
    listPrice,
    stock,
    featured: formData.get("featured") === "on",
    visible: formData.get("visible") === "on",
  });
  revalidatePath("/products");
  await revalidateShop();
  return { ok: true, message: `${product.name}을(를) 저장했습니다.` };
}
