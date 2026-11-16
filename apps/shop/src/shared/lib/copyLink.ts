/**
 * 공유 주소를 클립보드에 복사하고 화면에 보여 줄 안내를 돌려준다.
 * 복사할 수 없으면(권한 거부, 오래된 브라우저) 주소를 안내에 그대로 담아 직접 복사할 수 있게 한다.
 */
export async function copyLink(url: string, what: string): Promise<string> {
  try {
    await navigator.clipboard.writeText(url);
    return `${what} 주소를 복사했습니다.`;
  } catch {
    return `복사하지 못했습니다. 이 주소를 직접 복사하세요: ${url}`;
  }
}
