/** 쇼핑몰 캐시를 갱신한다. 태그를 주지 않으면 판매 정보(merch) 캐시를 비운다. 설정이 없으면(로컬) 건너뛴다. */
export async function revalidateShop(tags?: string[]): Promise<void> {
  const url = process.env.MFG_SHOP_URL;
  const secret = process.env.MFG_REVALIDATE_SECRET;
  if (!url || !secret) return;
  try {
    await fetch(`${url}/api/revalidate`, {
      method: "POST",
      headers: { "x-revalidate-secret": secret, "content-type": "application/json" },
      body: JSON.stringify(tags ? { tags } : {}),
    });
  } catch (error) {
    console.error("[admin] 쇼핑몰 캐시를 갱신하지 못했습니다.", error);
  }
}
