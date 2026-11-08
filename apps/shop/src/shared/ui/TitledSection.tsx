import type { ReactNode } from "react";

type TitledSectionProps = {
  /** 페이지 안에서뿐 아니라 화면 사이에서도 겹치지 않는 id (예: `product-${slug}-spec`) */
  id: string;
  title: ReactNode;
  children: ReactNode;
  as?: "section" | "aside";
  level?: 2 | 3;
  className?: string;
  titleClassName?: string;
};

/**
 * 제목과 aria-labelledby를 연결한 구역.
 * Cache Components는 이전 화면을 숨긴 채 DOM에 남기므로, id는 화면마다 다른 값을 넘긴다.
 * (서버의 useId는 화면마다 같은 값부터 시작해 겹칠 수 있다)
 */
export function TitledSection({ id, title, children, as = "section", level = 2, className, titleClassName }: TitledSectionProps) {
  const Tag = as;
  const Heading = `h${level}` as const;
  const titleId = `${id}-title`;
  return (
    <Tag id={id} aria-labelledby={titleId} className={className}>
      <Heading id={titleId} className={titleClassName}>
        {title}
      </Heading>
      {children}
    </Tag>
  );
}
