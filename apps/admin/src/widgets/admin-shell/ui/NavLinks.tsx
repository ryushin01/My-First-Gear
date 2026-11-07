"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "대시보드" },
  { href: "/products", label: "상품 판매 정보" },
  { href: "/orders", label: "주문" },
  { href: "/consults", label: "구매 상담" },
];

export function NavLinks() {
  const pathname = usePathname();
  const isCurrent = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  return (
    <ul className="menu-list">
      {LINKS.map((link) => (
        <li key={link.href}>
          <Link href={link.href} className={isCurrent(link.href) ? "is-active" : undefined} aria-current={isCurrent(link.href) ? "page" : undefined}>
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
