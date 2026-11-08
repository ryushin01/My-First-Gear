import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAction } from "@/features/auth";
import { NavLinks } from "./NavLinks";

export function AdminShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <a href="#main" className="skip-link">
        본문 바로가기
      </a>
      <header>
        <nav className="navbar is-dark" aria-label="어드민 상단">
          <div className="navbar-brand">
            <Link className="navbar-item has-text-weight-bold" href="/">
              My First Gear 어드민
            </Link>
          </div>
          <div className="navbar-end is-flex is-align-items-center px-3">
            <form action={logoutAction}>
              <button type="submit" className="button is-small is-dark is-outlined is-inverted">
                로그아웃
              </button>
            </form>
          </div>
        </nav>
      </header>
      <div className="columns is-mobile-wrap m-0">
        <aside className="column is-narrow px-4 py-5 admin-aside has-background-white-ter">
          <nav className="menu" aria-label="어드민 메뉴">
            <p className="menu-label has-text-grey-dark">관리</p>
            <NavLinks />
          </nav>
        </aside>
        <main id="main" tabIndex={-1} className="column admin-main px-5 py-5">
          <h1 className="title">{title}</h1>
          {children}
        </main>
      </div>
    </>
  );
}
