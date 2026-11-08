"use client";

import Link from "next/link";
import { useMemberName } from "@/entities/member";

export function AccountLink() {
  const name = useMemberName();
  return (
    <Link href={name ? "/my" : "/login"} className="inline-flex min-h-8 items-center hover:text-cream">
      {name ? (
        <>
          My<span className="sr-only">페이지 ({name}님)</span>
        </>
      ) : (
        "로그인"
      )}
    </Link>
  );
}
