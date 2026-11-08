import { orderStatusLabel, type OrderStatus } from "../model/types";

const FLOW: OrderStatus[] = ["paid", "preparing", "assembling", "shipped", "delivered"];
const time = new Intl.DateTimeFormat("ko-KR", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Seoul" });

/**
 * 주문 단계 타임라인. 지나온 단계는 시각과 함께, 남은 단계는 흐리게 보여 준다.
 * 조립 서비스가 없는 주문은 조립 단계를 건너뛴다.
 */
export function OrderTimeline({ events, assembly }: { events: { status: OrderStatus; createdAt: string | Date }[]; assembly: boolean }) {
  const reached = new Map(events.map((e) => [e.status, e.createdAt]));
  const cancelled = reached.get("cancelled");
  const steps = FLOW.filter((s) => assembly || s !== "assembling");
  return (
    <ol className="flex flex-col gap-1.5 text-sm">
      {steps.map((status) => {
        const at = reached.get(status);
        return (
          <li key={status} className={`flex gap-3 ${at ? "text-cream" : "text-mute-200"}`}>
            <span aria-hidden="true">{at ? "●" : "○"}</span>
            <span className="min-w-24">{orderStatusLabel[status]}</span>
            <span className="font-mono text-xs tabular-nums">{at ? time.format(new Date(at)) : "대기"}</span>
            <span className="sr-only">{at ? "완료" : "아직"}</span>
          </li>
        );
      })}
      {cancelled && (
        <li className="flex gap-3 text-brand">
          <span aria-hidden="true">×</span>
          <span className="min-w-24">주문 취소</span>
          <span className="font-mono text-xs tabular-nums">{time.format(new Date(cancelled))}</span>
        </li>
      )}
    </ol>
  );
}
