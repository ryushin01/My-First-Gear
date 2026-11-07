/** 판매 정보를 바꾼 뒤 쇼핑몰 캐시를 갱신한다. 설정이 없으면(로컬) 건너뛴다. */
export async function revalidateShop(): Promise<void> {
  const url = process.env.MFG_SHOP_URL;
  const secret = process.env.MFG_REVALIDATE_SECRET;
  if (!url || !secret) return;
  try {
    await fetch(`${url}/api/revalidate`, { method: "POST", headers: { "x-revalidate-secret": secret } });
  } catch (error) {
    console.error("[admin] 쇼핑몰 캐시를 갱신하지 못했습니다.", error);
  }
}
