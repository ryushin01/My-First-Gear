// 카탈로그 기본값으로 product_merch 시드 SQL을 만든다. 사용: node --experimental-strip-types scripts/seed-sql.ts <파일>
import { writeFileSync } from "node:fs";
import { products } from "../../catalog/src/products.ts";

const q = (v: string) => `'${v.replaceAll("'", "''")}'`;
const rows = products.map(
  (p) => `(${q(p.id)}, ${p.price}, ${p.listPrice ?? "NULL"}, ${p.stock}, ${p.featured ? "true" : "false"}, true)`,
);
const sql = `-- 상품 판매 정보 시드 (가상 가격과 재고)
INSERT INTO "product_merch" ("product_id", "price", "list_price", "stock", "featured", "visible") VALUES
${rows.join(",\n")}
ON CONFLICT ("product_id") DO NOTHING;
`;
writeFileSync(process.argv[2], sql);
console.log(`${products.length} rows`);
