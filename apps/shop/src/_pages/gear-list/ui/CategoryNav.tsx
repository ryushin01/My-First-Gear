import Link from "next/link";
import { categories, categoryGroups, channelOf, type CategoryId } from "@mfg/catalog";

/** 카테고리를 그룹별 채널 목록으로 보여준다. */
export function CategoryNav({ current }: { current?: CategoryId }) {
  return (
    <nav aria-label="카테고리">
      <ul className="flex flex-col gap-5">
        <li>
          <Link
            href="/gear"
            aria-current={current ? undefined : "page"}
            className="inline-flex min-h-8 items-center font-mono text-xs uppercase text-label hover:text-cream aria-[current=page]:text-brand"
          >
            전체 기어
          </Link>
        </li>
        {categoryGroups.map((group) => (
          <li key={group.id}>
            <p className="mono-label mb-1.5">[{group.code}]</p>
            <ul className="flex flex-wrap gap-x-3 gap-y-1 lg:flex-col">
              {categories
                .filter((category) => category.group === group.id)
                .map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/gear/${category.id}`}
                      aria-current={current === category.id ? "page" : undefined}
                      className="inline-flex min-h-8 items-center gap-2 text-sm text-mute-100 hover:text-cream aria-[current=page]:text-brand"
                    >
                      <span aria-hidden="true" className="font-mono text-[11px] text-label">
                        {channelOf(category.id)}
                      </span>
                      {category.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}
