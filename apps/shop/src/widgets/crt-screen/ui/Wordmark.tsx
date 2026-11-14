import Image from "next/image";

/** 로고(트로피 아이콘). 이름은 감싼 링크의 aria-label이 제공합니다. */
export function Wordmark() {
  return <Image src="/brand/logo.png" alt="" width={44} height={44} className="block size-11" />;
}
