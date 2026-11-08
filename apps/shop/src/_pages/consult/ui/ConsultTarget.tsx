"use client";

import { useSearchParams } from "next/navigation";
import { getProductBySlug } from "@mfg/catalog";
import { ConsultForm } from "./ConsultForm";

export function ConsultTarget() {
  const slug = useSearchParams().get("product");
  const product = slug ? getProductBySlug(slug) : undefined;
  return <ConsultForm product={product?.purchaseMode === "consult" ? product : undefined} />;
}
