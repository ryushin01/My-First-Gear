// 데모 회원, 후기, 질문 시드 SQL을 만든다. 사용: node --experimental-strip-types scripts/seed-community-sql.ts <파일>
import { writeFileSync } from "node:fs";
import { SEED_MEMBERS, SEED_QUESTIONS, SEED_REVIEWS } from "../src/seed.ts";

const q = (v: string | null) => (v === null ? "NULL" : `'${v.replaceAll("'", "''")}'`);
const sql = `-- 데모 회원(비밀번호 demo1234), 후기, 상품 질문 시드
INSERT INTO "users" ("id", "email", "name", "password_hash") VALUES
${SEED_MEMBERS.map((m) => `(${m.id}, ${q(m.email)}, ${q(m.name)}, ${q(m.passwordHash)})`).join(",\n")}
ON CONFLICT DO NOTHING;
--> statement-breakpoint
SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT max(id) FROM "users"));
--> statement-breakpoint
INSERT INTO "reviews" ("product_id", "user_id", "rating", "body") VALUES
${SEED_REVIEWS.map((r) => `(${q(r.productId)}, ${r.userId}, ${r.rating}, ${q(r.body)})`).join(",\n")}
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "questions" ("product_id", "user_id", "body", "answer", "answered_at") VALUES
${SEED_QUESTIONS.map((x) => `(${q(x.productId)}, ${x.userId}, ${q(x.body)}, ${q(x.answer)}, ${x.answer ? "now()" : "NULL"})`).join(",\n")};
`;
writeFileSync(process.argv[2], sql);
console.log("ok");
