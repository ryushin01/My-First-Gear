import Link from "next/link";
import type { ReactNode } from "react";
import { CartCount } from "@/entities/cart";
import { BwToggle } from "./BwToggle";
import { LocalClock } from "./LocalClock";
import { Timecode } from "./Timecode";
import { Wordmark } from "./Wordmark";

const NAV = [
  { href: "/gear", label: "Gear" },
  { href: "/build", label: "PC 견적" },
  { href: "/assembly", label: "조립 서비스" },
  { href: "/cart", label: "장바구니" },
];

type CrtScreenProps = {
  children: ReactNode;
  /** 하단 상태 표시줄의 SOURCE 값. 지금 보고 있는 상품이나 카테고리 */
  source?: ReactNode;
};

/** 브라운관 TV 화면 프레임. 헤더, 본문, 하단 상태 표시줄로 이루어진다. */
export function CrtScreen({ children, source = "MY FIRST GEAR" }: CrtScreenProps) {
  return (
    <div className="crt-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-60 focus:bg-cream focus:px-3 focus:py-2 focus:text-ink"
      >
        본문 바로가기
      </a>

      <header className="crt-chrome-top sticky top-0 z-40 grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 px-5 pt-5 pb-3 md:grid-cols-[1fr_auto_1fr] md:px-16 md:pt-12">
        <div className="flex items-center gap-8 font-mono text-xs uppercase text-label">
          <Link href="/" className="hover:text-cream">
            Home
          </Link>
          <span className="hidden md:inline">
            <Timecode />
          </span>
        </div>
        <Link href="/" aria-label="My First Gear 홈" className="col-span-2 justify-self-center md:order-none md:col-span-1 -order-1">
          <Wordmark />
        </Link>
        <nav aria-label="주요 메뉴" className="justify-self-end">
          <ul className="flex flex-wrap justify-end gap-x-4 gap-y-1 font-mono md:gap-x-6 text-xs uppercase text-label">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-cream">
                  {item.label}
                  {item.href === "/cart" && <CartCount />}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main id="main" tabIndex={-1} className="crt-content min-w-0 flex-1 px-5 md:px-16">
        {children}
      </main>

      <footer className="crt-chrome-bottom sticky bottom-0 z-40 px-5 pb-5 pt-3 md:px-16 md:pb-12">
        <div className="grid grid-cols-2 items-center gap-4 font-mono text-xs uppercase text-label md:grid-cols-4">
          <LocalClock />
          <BwToggle />
          <p className="hidden md:block">Source: {source}</p>
          <p className="col-span-2 normal-case md:col-span-1 md:justify-self-end">포트폴리오 데모 · 실제 판매하지 않습니다</p>
        </div>
      </footer>
    </div>
  );
}
