import { connection } from "next/server";
import { Suspense } from "react";
import { getQuestions, getReviews } from "../api/communityQueries";
import { QuestionForm, ReviewForm } from "./CommunityForms";

const date = new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeZone: "Asia/Seoul" });

async function ReviewList({ productId }: { productId: string }) {
  await connection(); // 빌드 때 만든 빈 목록이 정적 HTML에 남지 않게 요청 때 렌더링한다 (데이터는 캐시)
  const reviews = await getReviews(productId);
  if (reviews.length === 0) return <p className="text-sm text-mute-200">아직 등록된 후기가 없습니다.</p>;
  return (
    <ul className="flex flex-col gap-3">
      {reviews.map((review) => (
        <li key={review.id} className="rounded-md border border-white/10 p-4">
          <p className="flex flex-wrap items-center gap-x-3 font-mono text-xs text-label">
            <span>
              <span aria-hidden="true">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
              <span className="sr-only">별점 5점 중 {review.rating}점</span>
            </span>
            <span>{review.author}</span>
            <time dateTime={new Date(review.createdAt).toISOString()}>{date.format(new Date(review.createdAt))}</time>
          </p>
          <p className="mt-2 text-sm text-mute-100">{review.body}</p>
        </li>
      ))}
    </ul>
  );
}

async function QuestionList({ productId }: { productId: string }) {
  await connection();
  const questions = await getQuestions(productId);
  if (questions.length === 0) return <p className="text-sm text-mute-200">아직 등록된 질문이 없습니다.</p>;
  return (
    <ul className="flex flex-col gap-3">
      {questions.map((q) => (
        <li key={q.id} className="rounded-md border border-white/10 p-4">
          <p className="font-mono text-xs text-label">
            Q · {q.author} · {q.answer ? "답변 완료" : "답변 대기"}
          </p>
          <p className="mt-2 text-sm">{q.body}</p>
          {q.answer && (
            <p className="mt-3 border-l-2 border-brand pl-3 text-sm text-mute-100">
              <span className="font-mono text-xs text-label">A · My First Gear</span>
              <br />
              {q.answer}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}

const loading = <p className="text-sm text-mute-200">불러오는 중…</p>;

/** 상품 상세 아래의 후기와 Q&A */
export function ProductCommunity({ productId, reviewCount }: { productId: string; reviewCount: number }) {
  return (
    <div className="grid gap-10 border-t border-white/10 pt-10 lg:grid-cols-2">
      <section aria-labelledby={`${productId}-reviews`} className="flex flex-col gap-4">
        <h2 id={`${productId}-reviews`} className="font-display text-3xl">
          후기
        </h2>
        <p className="font-mono text-xs text-label">누적 후기 {reviewCount.toLocaleString("ko-KR")}개 중 회원 후기</p>
        <Suspense fallback={loading}>
          <ReviewList productId={productId} />
        </Suspense>
        <ReviewForm productId={productId} />
      </section>
      <section aria-labelledby={`${productId}-qna`} className="flex flex-col gap-4">
        <h2 id={`${productId}-qna`} className="font-display text-3xl">
          Q&amp;A
        </h2>
        <Suspense fallback={loading}>
          <QuestionList productId={productId} />
        </Suspense>
        <QuestionForm productId={productId} />
      </section>
    </div>
  );
}
