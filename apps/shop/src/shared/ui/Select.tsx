import type { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  /** 왼쪽 안쪽 여백. sm: 8px(목록 정렬), md: 12px(폼 칸) */
  inset?: "sm" | "md";
  /** 감싼 요소의 클래스 (폼 칸처럼 너비를 채울 때 flex 등) */
  wrapperClassName?: string;
};

/*
 * 셀렉트: 브라우저 기본 화살표는 위치를 맞출 수 없어 appearance: none으로 끄고 직접 그린다(전역 기준).
 * 화살표 오른쪽 끝과 칸 오른쪽 끝 사이 = 글자와 칸 왼쪽 끝 사이(테두리 1px + 안쪽 여백), 오른쪽 여백은 화살표 자리만큼 넓힌다.
 * 화살표는 꾸밈이라 보조기기에서 숨기고 클릭을 셀렉트로 흘려보낸다.
 */
const INSET = {
  sm: { select: "pl-2 pr-[26px]", arrow: "right-[9px]" },
  md: { select: "pl-3 pr-[30px]", arrow: "right-[13px]" },
} as const;

export function Select({ inset = "sm", wrapperClassName = "relative inline-flex", className = "", children, ...props }: SelectProps) {
  return (
    <span className={wrapperClassName}>
      <select {...props} className={`appearance-none ${INSET[inset].select} ${className}`}>
        {children}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 10 6"
        className={`pointer-events-none absolute top-1/2 h-1.5 w-2.5 -translate-y-1/2 text-label ${INSET[inset].arrow}`}
      >
        <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
