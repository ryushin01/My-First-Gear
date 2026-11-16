import "server-only";
import { SITE_NAME, SITE_URL } from "@/shared/config";

type SharePage = {
  /** 미리보기 제목. 예) "PC 견적 · 8/8칸 · 2,345,000원" */
  title: string;
  description: string;
  /** 공유 이미지 주소 (사이트 안의 경로) */
  image: string;
  /** 사람이 열면 넘어갈 화면 (사이트 안의 경로). 예) /build?b=… */
  target: string;
};

const escape = (value: string) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * 공유 주소(/share/build, /share/setup)의 응답: 메신저 미리보기 봇에는 그 구성의 제목·이미지 태그를 주고,
 * 사람은 바로 견적·셋업 화면으로 넘긴다. 견적·셋업 화면은 정적 캐시로 두고(요청마다 그리지 않게) 공유할 때만 이 함수가 돈다.
 * 검색에는 노출하지 않는다.
 */
export function sharePage({ title, description, image, target }: SharePage): Response {
  const imageUrl = escape(new URL(image, SITE_URL).href);
  const targetUrl = escape(new URL(target, SITE_URL).href);
  const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)} · ${SITE_NAME}</title>
<meta name="robots" content="noindex">
<meta name="description" content="${escape(description)}">
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:locale" content="ko_KR">
<meta property="og:type" content="website">
<meta property="og:title" content="${escape(title)}">
<meta property="og:description" content="${escape(description)}">
<meta property="og:url" content="${targetUrl}">
<meta property="og:image" content="${imageUrl}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${escape(title)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escape(title)}">
<meta name="twitter:description" content="${escape(description)}">
<meta name="twitter:image" content="${imageUrl}">
<link rel="canonical" href="${targetUrl}">
<meta http-equiv="refresh" content="0; url=${escape(target)}">
<style>html{background:#050505;color:#fcf8ef;font-family:system-ui,sans-serif}a{color:#fcf8ef}</style>
</head>
<body><p><a href="${escape(target)}">${escape(title)} 열기</a></p></body>
</html>`;
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=3600", "x-robots-tag": "noindex" },
  });
}
