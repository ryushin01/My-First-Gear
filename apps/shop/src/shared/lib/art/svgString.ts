import { Fragment, isValidElement, type ReactNode } from "react";

// SVG 속성 중 카멜 표기를 그대로 두는 것
const KEEP = new Set(["viewBox", "preserveAspectRatio"]);
const attrName = (key: string) => (key === "className" ? "class" : KEEP.has(key) ? key : key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`));
const escape = (value: string) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/**
 * 상품 그림(React SVG 요소)을 SVG 문자열로 바꾼다.
 * OG 이미지는 서버 컴포넌트 그래프라 react-dom/server를 쓸 수 없어 직접 직렬화한다.
 */
export function toSvgString(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return escape(String(node));
  if (Array.isArray(node)) return node.map(toSvgString).join("");
  if (!isValidElement(node)) return "";
  const { children, ...props } = node.props as Record<string, unknown> & { children?: ReactNode };
  if (node.type === Fragment) return toSvgString(children);
  if (typeof node.type === "function") return toSvgString((node.type as (p: unknown) => ReactNode)(node.props));
  const attrs = Object.entries(props)
    .filter(([key, value]) => key !== "key" && value !== undefined && value !== null && value !== false && typeof value !== "function")
    .map(([key, value]) => ` ${attrName(key)}="${escape(String(value))}"`)
    .join("");
  return `<${String(node.type)}${attrs}>${toSvgString(children)}</${String(node.type)}>`;
}
