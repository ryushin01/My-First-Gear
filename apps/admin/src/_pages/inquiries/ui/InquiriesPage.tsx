import type { Metadata } from "next";
import { connection } from "next/server";
import { getProductById } from "@mfg/catalog";
import { getDb, listInquiriesForAdmin, listQuestionsForAdmin } from "@mfg/db";
import { AnswerForm } from "./AnswerForm";
import { formatDateTime } from "@/shared/lib";
import { AdminShell } from "@/widgets/admin-shell";

export const inquiriesMetadata: Metadata = { title: "문의" };

const categoryLabel: Record<string, string> = { order: "주문·결제", delivery: "배송", assembly: "조립 서비스", as: "A/S", etc: "기타" };

export async function InquiriesPage() {
  await connection();
  const db = getDb();
  const [inquiries, questions] = await Promise.all([listInquiriesForAdmin(db), listQuestionsForAdmin(db)]);

  return (
    <AdminShell title="문의">
      <section className="mb-6" aria-labelledby="inquiries-title">
        <h2 id="inquiries-title" className="title is-5">
          1:1 문의 <span className="tag is-warning is-light">답변 대기 {inquiries.filter((i) => !i.answer).length}</span>
        </h2>
        {inquiries.length === 0 ? (
          <p>1:1 문의가 없습니다.</p>
        ) : (
          inquiries.map((inquiry) => (
            <article key={inquiry.id} className="box">
              <p className="is-size-7 has-text-grey-dark">
                [{categoryLabel[inquiry.category] ?? inquiry.category}] {inquiry.userName} ({inquiry.userEmail}) · {formatDateTime(inquiry.createdAt)}
              </p>
              <h3 className="title is-6 mt-1 mb-2">{inquiry.title}</h3>
              <p className="mb-3" style={{ whiteSpace: "pre-line" }}>
                {inquiry.body}
              </p>
              <AnswerForm kind="inquiry" id={inquiry.id} label={`“${inquiry.title}” 답변`} defaultValue={inquiry.answer} />
            </article>
          ))
        )}
      </section>

      <section aria-labelledby="questions-title">
        <h2 id="questions-title" className="title is-5">
          상품 Q&amp;A <span className="tag is-warning is-light">답변 대기 {questions.filter((q) => !q.answer).length}</span>
        </h2>
        {questions.length === 0 ? (
          <p>상품 질문이 없습니다.</p>
        ) : (
          questions.map((question) => (
            <article key={question.id} className="box">
              <p className="is-size-7 has-text-grey-dark">
                {getProductById(question.productId)?.name ?? question.productId} · {question.userName} · {formatDateTime(question.createdAt)}
              </p>
              <p className="my-2">{question.body}</p>
              <AnswerForm kind="question" id={question.id} label={`${question.userName}님 질문 답변`} defaultValue={question.answer} />
            </article>
          ))
        )}
      </section>
    </AdminShell>
  );
}
