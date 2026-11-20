import Link from "next/link";
import type { ReactNode } from "react";
import { CartCount } from "@/entities/cart";
import { MemberSync } from "./MemberSync";
import { AccountLink } from "./AccountLink";
import { BwToggle } from "./BwToggle";
import { FxToggle } from "./FxToggle";
import { LocalClock } from "./LocalClock";
import { ScreenShell } from "./ScreenShell";
import { Timecode } from "./Timecode";
import { Wordmark } from "./Wordmark";

const NAV = [
  { href: "/gear", label: "Gear" },
  { href: "/search", label: "검색" },
  { href: "/build", label: "PC 견적" },
  { href: "/assembly", label: "조립 서비스" },
  { href: "/cart", label: "장바구니" },
];

type CrtScreenProps = {
  children: ReactNode;
  /** 하단 상태 표시줄의 SOURCE 값. 지금 보고 있는 상품이나 카테고리 */
  source?: ReactNode;
  /**
   * 오류 화면용: 브라우저 저장값·회원 상태를 읽는 부분(장바구니 수량, 로그인 링크, 회원 동기화)을 빼고 그린다.
   * 그 부분이 오류의 원인이어도 오류 화면은 다시 죽지 않는다.
   */
  bare?: boolean;
};

/** HUD 화면 틀. 헤더, 본문, 하단 상태 표시줄로 이루어진다. */
export function CrtScreen({ children, source = "MY FIRST GEAR", bare = false }: CrtScreenProps) {
  return (
    <div className="crt-screen">
      {!bare && <MemberSync />}
      <ScreenShell
        header={
          <header className="crt-chrome-top sticky top-0 z-40 grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 px-5 pt-5 pb-3 md:grid-cols-[1fr_auto_1fr] md:px-16 md:pt-8 md:pb-4">
            <div className="flex items-center gap-3 font-mono text-xs uppercase text-label md:gap-6">
              <span aria-hidden="true" className="hud-tag">
                SYS
              </span>
              <Link href="/" className="inline-flex min-h-8 items-center hover:text-cream">
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
                    <Link
                      href={item.href}
                      className="inline-flex min-h-8 min-w-8 items-center justify-center border border-transparent px-1.5 hover:border-cream hover:bg-cream hover:text-ink"
                    >
                      {item.label}
                      {!bare && item.href === "/cart" && <CartCount />}
                    </Link>
                  </li>
                ))}
                {!bare && (
                  <li>
                    <AccountLink />
                  </li>
                )}
              </ul>
            </nav>
          </header>
        }
        footer={
          <footer className="crt-chrome-bottom sticky bottom-0 z-40 px-5 pb-5 pt-3 md:px-16 md:pb-8">
            <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 font-mono text-xs uppercase text-label md:grid-cols-4 md:gap-4">
              <LocalClock />
              <span className="flex flex-wrap justify-end gap-x-4 gap-y-2 md:justify-start">
                <BwToggle />
                <FxToggle />
              </span>
              <p className="hidden md:block">Source: {source}</p>
              {/* 좁은 화면에서는 상태 표시줄이 본문을 덜 가리게 상자 없이 한 줄로 */}
              <p className="col-span-2 flex flex-wrap gap-x-3 leading-5 md:col-span-1 md:justify-self-end md:border md:border-cream/60 md:px-2 md:py-1">
                <span className="hidden md:inline">Property of: MFG</span>
                <span className="normal-case">포트폴리오 데모, 실제로 판매하지 않습니다</span>
              </p>
            </div>
          </footer>
        }
      >
        {children}
      </ScreenShell>
    </div>
  );
}
