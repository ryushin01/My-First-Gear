import { discountRate, formatPrice, type Product } from "@mfg/catalog";

export function PriceTag({ product, size = "md" }: { product: Product; size?: "md" | "lg" }) {
  const rate = discountRate(product);
  const priceClass = size === "lg" ? "text-3xl md:text-4xl" : "text-base";

  return (
    <p className="flex flex-wrap items-baseline gap-x-2 font-mono tabular-nums">
      {rate !== null && <span className="text-brand">{rate}%</span>}
      <span className={`${priceClass} text-cream`}>
        <span className="sr-only">판매가 </span>
        {formatPrice(product.price)}
      </span>
      {product.listPrice && rate !== null && (
        <del className="text-xs text-mute-200">
          <span className="sr-only">정가 </span>
          {formatPrice(product.listPrice)}
        </del>
      )}
    </p>
  );
}
